use anchor_lang::prelude::*;

use anchor_spl::token::{Mint, TokenAccount};

use crate::state::metadata::{SolAccount, SOL_PDA_SEED};

#[derive(Accounts)]
#[instruction(_bump: u8)]
pub struct ExtractSolV2<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        mut,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
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
