use std::mem::size_of;

use anchor_lang::{prelude::*, AccountsClose};
use anchor_spl::token::{Mint, TokenAccount, Token, self};
use mpl_token_metadata::{
    ID as TokenMetadataProgramId,
    state::{Metadata, Collection}, 
    utils::{assert_currently_holding},
};
use solana_program::{
    program_memory::sol_memcmp,
    pubkey::{Pubkey, PUBKEY_BYTES}, program::{invoke_signed, invoke},
};
use spl_token::instruction::AuthorityType;

use crate::state::{metadata::{
 PARENT_PDA_SEED, SOL_PDA_SEED, ROOT_OWNER_SEED
}, SolAccount, ParentMetadata, pubkey_array_len};
use crate::state::{errors::SynftError, RootOwner};

use super::{into_set_authority_context, into_burn_context};

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

    if !ctx.accounts.payer.is_signer {
        return err!(SynftError::MissingRequiredSignature);
    }
 
    ctx.accounts.snowball_nft_metadata.size += 1;

    Ok(())
}

pub fn handle_extract_snowball_nft_sol_with_nft_burn(ctx: Context<ExtractSnowNftSolWithNftBurn>) -> Result<()> { 
    // burn nft 
    // TODO burn method for burn and this func
    let current_owner = &mut ctx.accounts.owner;
    let root_mint = &mut ctx.accounts.nft_mint;
    let root_token = &mut ctx.accounts.nft_token_account;
    let root_metadata = &mut ctx.accounts.inject_parent_metadata;
    let sol_account = &mut ctx.accounts.inject_sol_account;
    let token_program = &mut ctx.accounts.token_program;
    let old_root_owner = &mut ctx.accounts.inject_old_root_owner;

    let nft_metadata_info = &ctx.accounts.nft_metadata.to_account_info();

    let metadata: Metadata = Metadata::from_account_info(nft_metadata_info)?;

    assert_currently_holding(
        &TokenMetadataProgramId,
        &current_owner.to_account_info(),
        nft_metadata_info,
        &metadata,
        &root_mint.to_account_info(),
        &root_token.to_account_info(),
    )?;
    
    root_metadata.is_burnt = true;
    old_root_owner.owner = current_owner.key();

    if pubkey_array_len(&root_metadata.immediate_children) > 0 {
        token::set_authority(
            into_set_authority_context(
                token_program.to_account_info(), 
                root_token.to_account_info(), 
                current_owner.to_account_info()
            ),
            AuthorityType::AccountOwner,
            Some(root_metadata.key()),
        )?;
    } else {
        token::burn(
            into_burn_context(
                token_program.to_account_info(), 
                root_mint.to_account_info(), 
                root_token.to_account_info(), 
                current_owner.to_account_info()
            ), 
            root_token.amount)?;
        
        invoke(
            &spl_token::instruction::close_account(
                token_program.to_account_info().key,
                root_token.to_account_info().key,
                current_owner.to_account_info().key,
                current_owner.to_account_info().key,
                &[],
            )?,
            &[root_token.to_account_info(), current_owner.to_account_info(), current_owner.to_account_info(), token_program.to_account_info()],
        )?;

        root_metadata.close(current_owner.to_account_info())?;
        old_root_owner.close(current_owner.to_account_info())?;
    }
    sol_account.close(current_owner.to_account_info())?;

    // extract from snowball-nft
    assert_collection_mint_equal(
        &metadata.collection, 
        &ctx.accounts.collection_mint.key()
    )?;

    if ctx.accounts.snowball_nft_metadata.size < 1 {
        return err!(SynftError::NotEnoughNFTCount);
    }

    let pda_account = ctx.accounts.snowball_nft_metadata.to_account_info();
    let to_account = ctx.accounts.owner.to_account_info();

    let lamports_required = (Rent::get()?).minimum_balance(SnowballNftMetadata::space());
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

impl SnowballNftMetadata  {
    fn space() -> usize {
        8 + size_of::<Self>()
    }
}

#[account] 
pub struct SnowballNftUnique();


#[derive(Accounts)]
pub struct InitSnowballNft<'info> {
    #[account(
        init, 
        payer = payer,
        space = SnowballNftMetadata::space(),
        seeds = [SNOWBALL_NFT_METADATA_SEED, collection_mint.key().as_ref()],
        bump
    )]
    pub snowball_nft_metadata: Box<Account<'info, SnowballNftMetadata>>,
    pub collection_mint: Account<'info, Mint>,
    
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
    pub snowball_nft_unique: Box<Account<'info, SnowballNftUnique>>,

    pub nft_mint: Account<'info, Mint>,
    pub nft_token_account: Account<'info, TokenAccount>,
    /// CHECK: is not written to or read
    pub nft_metadata: UncheckedAccount<'info>,
    pub collection_mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)] 
pub struct ExtractSnowNftSolWithNftBurn<'info> {
    #[account(
        mut,
        seeds = [SNOWBALL_NFT_METADATA_SEED, collection_mint.key().as_ref()], 
        bump
    )]
    pub snowball_nft_metadata: Box<Account<'info, SnowballNftMetadata>>,

    #[account(
        mut,
        close = owner,
        seeds = [SNOWBALL_NFT_UNIQUE_SEED, nft_mint.key().as_ref()], 
        bump
    )]
    pub snowball_nft_unique: Box<Account<'info, SnowballNftUnique>>,

    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    #[account(mut)]
    pub nft_token_account: Account<'info, TokenAccount>,
    /// CHECK: is not written to or read
    #[account(mut)]
    pub nft_metadata: UncheckedAccount<'info>,
    pub collection_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = owner,
        space = size_of::<ParentMetadata>() + 8,
        constraint = nft_token_account.owner == *owner.to_account_info().key,
        constraint = nft_token_account.mint == nft_mint.key(),
        constraint = !inject_parent_metadata.is_burnt,
        seeds = [PARENT_PDA_SEED, nft_mint.key().as_ref()], bump,
    )]
    pub inject_parent_metadata : Box<Account<'info, ParentMetadata>>,
    #[account(
        init_if_needed,
        payer = owner,
        space = size_of::<SolAccount>() + 8,
        seeds = [SOL_PDA_SEED, nft_mint.key().as_ref()], bump,
    )]
    pub inject_sol_account : Box<Account<'info, SolAccount>>,
    #[account(
        init,
        payer = owner,
        space = size_of::<RootOwner>() + 8,
        seeds = [ROOT_OWNER_SEED, nft_mint.key().as_ref()], bump,
    )]
    pub inject_old_root_owner: Box<Account<'info, RootOwner>>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
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
