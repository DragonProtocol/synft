use crate::state::metadata::{SolAccount, SOL_PDA_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount};
#[derive(Accounts)]
#[instruction(_bump: u8)]
pub struct BurnForSolV2<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_mint_account: Account<'info, Mint>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
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
    pub token_program: Program<'info, Token>,
}

impl<'info> BurnForSolV2<'info> {
    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.parent_mint_account.to_account_info().clone(),
            to: self.parent_token_account.to_account_info().clone(),
            authority: self.current_owner.to_account_info().clone(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<BurnForSolV2>, _bump: u8) -> Result<()> {
    token::burn(
        ctx.accounts.into_burn_context(),
        ctx.accounts.parent_token_account.amount,
    )?;
    Ok(())
}
