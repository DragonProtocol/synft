use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use crate::state::metadata::{ChildrenMetadataV2, ParentMetadata, PARENT_PDA_SEED};
use anchor_lang::AccountsClose;

#[derive(Accounts)]
#[instruction(_bump: u8)]
pub struct ExtractSolV2<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    pub root_mint_account: Box<Account<'info, Mint>>,
    #[account(
        constraint = root_token_account.amount == 1,
        constraint = root_token_account.mint == root_mint_account.key(),
        constraint = root_token_account.owner == current_owner.key(),
    )]
    pub root_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = root_meta.parent == root_mint_account.key(),
        constraint = root_meta.root == root_meta.key(),
        constraint = root_meta.is_mutable == true,
        constraint = root_meta.is_mutated == false,
        constraint = root_meta.is_burnt == false,
    )]
    pub root_meta: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = 8+1,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        constraint = self_metadata.bump == _bump,
        seeds = [PARENT_PDA_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub self_metadata: Account<'info, ParentMetadata>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<ExtractSolV2>, _bump: u8) -> Result<()> {
    ctx.accounts
        .self_metadata
        .close(ctx.accounts.current_owner.to_account_info())?;
    Ok(())
}
