use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, TokenAccount};

use crate::state::metadata::{ChildrenMetadataV2, SolAccount, SOL_PDA_SEED};

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
        mut,
        constraint = (parent_token_account.owner == *current_owner.to_account_info().key || parent_token_account.owner == *root_meta.to_account_info().key),
        constraint = parent_token_account.mint == parent_mint_account.key(),
        constraint = sol_account.bump == _bump,
        seeds = [SOL_PDA_SEED, parent_mint_account.key().as_ref()],
        bump = sol_account.bump,
        close = current_owner
    )]
    pub sol_account: Account<'info, SolAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(_ctx: Context<ExtractSolV2>, _bump: u8) -> Result<()> {
    // close meta_data account
    Ok(())
}
