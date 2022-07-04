use std::mem::size_of;

use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use mpl_token_metadata::ID as TokenMetadataProgramId;
use mpl_token_metadata::{state::{Metadata, Collection}, utils::{assert_initialized, assert_currently_holding}};
use solana_program::{
    program_memory::sol_memcmp,
    pubkey::{Pubkey, PUBKEY_BYTES},
};

use crate::state::errors::SynftError;

pub const SNOWBALL_NFT_METADATA_SEED: &[u8] = b"snowball-nft-metadata";
pub const SNOWBALL_NFT_UNIQUE_SEED: &[u8]= b"snowball-nft-unique";


pub fn handle_init_snowball_nft(ctx: Context<InitSnowballNft>) -> Result<()> {
    ctx.accounts.snowball_nft_metadata.size = 0;
    ctx.accounts.snowball_nft_metadata.collection_mint = ctx.accounts.collection_mint.key();
    Ok(())
}

pub fn handle_update_snowball_nft(ctx: Context<UpdateSnowballNft>) -> Result<()> {
    let nft_mint_info = &ctx.accounts.nft_mint.to_account_info();
    let nft_token_account_info = &ctx.accounts.nft_token_account.to_account_info();
    let metadata_info = &ctx.accounts.nft_metadata.to_account_info();
    let owner_info = &ctx.accounts.payer.to_account_info();

    let metadata: Metadata = Metadata::from_account_info(metadata_info)?;

    assert_currently_holding(
        &TokenMetadataProgramId,
        owner_info,
        metadata_info,
        &metadata,
        nft_mint_info,
        nft_token_account_info,
    )?;

    if !metadata.mint.eq(&ctx.accounts.nft_mint.key()) {
        return err!(SynftError::NftMetadataNotMatch);
    }

    assert_collection_mint_equal(
        &metadata.collection, 
        &ctx.accounts.collection_mint.key()
    )?;

    // TODO check payer is signer，check payer is nft owner
    if !ctx.accounts.payer.is_signer {
        return err!(SynftError::MissingRequiredSignature);
    }
 
    ctx.accounts.snowball_nft_metadata.size += 1;

    Ok(())
}

// TODO 只能和提取一起调用
pub fn handle_extract_snowball_nft_sol_to_user(ctx: Context<ExtractSolToUser>) -> Result<()> { 
    let metadata: Metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata.to_account_info())?;
    assert_collection_mint_equal(
        &metadata.collection, 
        &ctx.accounts.collection_mint.key()
    )?;

    if ctx.accounts.snowball_nft_metadata.size < 1 {
        return err!(SynftError::NotEnoughNFTCount);
    }

    let pda_account = ctx.accounts.snowball_nft_metadata.to_account_info();
    let to_account = ctx.accounts.payer.to_account_info();

    let lamports_required = (Rent::get()?).minimum_balance(size_of::<Collection>());
    let pda_lamports = **pda_account.try_borrow_lamports()?;

    let divided_amount = (pda_lamports - lamports_required) / (ctx.accounts.snowball_nft_metadata.size as u64);

    ctx.accounts.snowball_nft_metadata.size -= 1;

    **pda_account.try_borrow_mut_lamports()? = pda_account.lamports()
        .checked_sub(divided_amount)
        .ok_or(SynftError::NumericalOverflowError)?;
    **to_account.try_borrow_mut_lamports()? = to_account.lamports()
        .checked_add(divided_amount)
        .ok_or(SynftError::NumericalOverflowError)?;

    Ok(())
}

#[account]
pub struct SnowballNftMetadata {
    size: u64,
    collection_mint: Pubkey,
}

#[account] 
pub struct SnowballNftUnique();


#[derive(Accounts)]
pub struct InitSnowballNft<'info> {
    #[account(
        init, 
        payer = payer,
        space = 8 + size_of::<SnowballNftMetadata>(),
        seeds = [SNOWBALL_NFT_METADATA_SEED, collection_mint.key().as_ref()],
        bump
    )]
    pub snowball_nft_metadata: Box<Account<'info, SnowballNftMetadata>>,
    /// CHECK: is not written to or read
    pub collection_mint: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}


#[derive(Accounts)]
pub struct UpdateSnowballNft<'info> {
    #[account(
        mut,
        seeds = [SNOWBALL_NFT_METADATA_SEED, collection_mint.key().as_ref()], 
        bump
    )]
    pub snowball_nft_metadata: Box<Account<'info, SnowballNftMetadata>>,

    #[account(
        init,
        space = 8 + size_of::<SnowballNftUnique>(), 
        payer = payer,
        seeds = [SNOWBALL_NFT_UNIQUE_SEED, nft_mint.key().as_ref()], 
        bump
    )]
    pub snowball_pda_unique: Box<Account<'info, SnowballNftUnique>>,

    pub nft_mint: Account<'info, Mint>,
    pub nft_token_account: Account<'info, TokenAccount>,
    /// CHECK: is not written to or read
    pub nft_metadata: UncheckedAccount<'info>,
    /// CHECK: is not written to or read
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)] 
pub struct ExtractSolToUser<'info> {
    #[account(
        mut,
        seeds = [SNOWBALL_NFT_METADATA_SEED, collection_mint.key().as_ref()], 
        bump
    )]
    pub snowball_nft_metadata: Box<Account<'info, SnowballNftMetadata>>,

    /// CHECK: is not written to or read
    pub nft_metadata: UncheckedAccount<'info>,
    /// CHECK: is not written to or read
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

pub fn cmp_pubkeys(a: &Pubkey, b: &Pubkey) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

pub fn assert_collection_mint_equal(
    metadata_collection: &Option<Collection>,
    collection_mint: &Pubkey,
) -> Result<()> {
    if let Some(metadata_collection) = metadata_collection {
        if !metadata_collection.verified {
            return err!(SynftError::CollectionNotVerified);
        }
        if !cmp_pubkeys(&metadata_collection.key, collection_mint) {
            msg!("CollectionMintNotEqual");
            return err!(SynftError::CollectionMintNotEqual);
        }
    } else {
        msg!("MetadataCollectionIsNone");
        return err!(SynftError::MetadataCollectionIsNone);
    }
    Ok(())
}
