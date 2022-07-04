use std::mem::size_of;

use anchor_lang::prelude::*;
use mpl_token_metadata::state::{Metadata, Collection};
use solana_program::{
    program_memory::sol_memcmp,
    pubkey::{Pubkey, PUBKEY_BYTES},
};

use crate::state::errors::Error;

pub const SNOWBALL_NFT_SEED: &[u8] = b"snowball-nft";


pub fn handle_init_snowball_nft(ctx: Context<InitSnowballNft>) -> Result<()> {
    ctx.accounts.snowball_pda.size = 0;
    ctx.accounts.snowball_pda.mint = ctx.accounts.collection_mint.key();
    Ok(())
}

pub fn handle_update_snowball_nft(ctx: Context<UpdateSnowballNft>) -> Result<()> {
    let metadata: Metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata.to_account_info())?;
    assert_collection_mint_equal(
        &metadata.collection, 
        &ctx.accounts.collection_mint.key()
    )?;
        
    ctx.accounts.snowball_pda.size += 1;

    Ok(())
}

pub fn handle_extract_snowball_nft_sol_to_user(ctx: Context<ExtractSolToUser>) -> Result<()> { 
    let metadata: Metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata.to_account_info())?;
    assert_collection_mint_equal(
        &metadata.collection, 
        &ctx.accounts.collection_mint.key()
    )?;

    if ctx.accounts.snowball_pda.size < 1 {
        return err!(Error::NotEnoughNFTCount);
    }

    let pda_account = ctx.accounts.snowball_pda.to_account_info();
    let to_account = ctx.accounts.payer.to_account_info();

    let lamports_required = (Rent::get()?).minimum_balance(size_of::<Collection>());
    let pda_lamports = **pda_account.try_borrow_lamports()?;

    let divided_amount = (pda_lamports - lamports_required) / (ctx.accounts.snowball_pda.size as u64);

    ctx.accounts.snowball_pda.size -= 1;
    **pda_account.try_borrow_mut_lamports()? -= divided_amount;
    **to_account.try_borrow_mut_lamports()? += divided_amount;

    Ok(())
}

#[account]
pub struct SnowballNft {
    size: u64,
    mint: Pubkey,
}

#[derive(Accounts)]
pub struct InitSnowballNft<'info> {
    #[account(
        init, 
        payer = payer,
        space = 8 + size_of::<SnowballNft>(),
        seeds = [SNOWBALL_NFT_SEED, collection_mint.key().as_ref()],
        bump
    )]
    pub snowball_pda: Box<Account<'info, SnowballNft>>,
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
        seeds = [SNOWBALL_NFT_SEED, collection_mint.key().as_ref()], 
        bump
    )]
    pub snowball_pda: Box<Account<'info, SnowballNft>>,
    /// CHECK: is not written to or read
    pub nft_metadata: UncheckedAccount<'info>,
    /// CHECK: is not written to or read
    pub collection_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)] 
pub struct ExtractSolToUser<'info> {
    #[account(
        mut,
        seeds = [SNOWBALL_NFT_SEED, collection_mint.key().as_ref()], 
        bump
    )]
    pub snowball_pda: Box<Account<'info, SnowballNft>>,
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
        if !cmp_pubkeys(&metadata_collection.key, collection_mint) {
            msg!("CollectionMintNotEqual");
            return err!(Error::CollectionMintNotEqual);
        }
    } else {
        msg!("MetadataCollectionIsNone");
        return err!(Error::MetadataCollectionIsNone);
    }
    Ok(())
}
