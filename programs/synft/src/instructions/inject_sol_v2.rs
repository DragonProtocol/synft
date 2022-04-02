use anchor_lang::prelude::*;

use crate::state::metadata::{SolAccount, SOL_PDA_SEED};
use anchor_spl::token::{Mint, TokenAccount};
use solana_program::program::invoke;
use solana_program::system_instruction;
use std::mem::size_of;

#[derive(Accounts)]
pub struct InjectSolV2<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = current_owner,
         // space: 8 discriminator + 1 bump
        space = size_of::<SolAccount>() + 8,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        seeds = [SOL_PDA_SEED, parent_mint_account.key().as_ref()], bump
    )]
    pub sol_account: Account<'info, SolAccount>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InjectSolV2>, _bump: u8, inject_sol_amount: u64) -> Result<()> {
    ctx.accounts.sol_account.bump = _bump;

    invoke(
        &system_instruction::transfer(
            ctx.accounts.current_owner.key,
            ctx.accounts.sol_account.to_account_info().key,
            inject_sol_amount,
        ),
        &[
            ctx.accounts.current_owner.to_account_info(),
            ctx.accounts.sol_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    Ok(())
}
