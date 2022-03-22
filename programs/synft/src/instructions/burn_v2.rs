use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Mint, Token, TokenAccount, Burn
};
use crate::state::metadata::{
    PARENT_PDA_SEED, SOL_PDA_SEED, ParentMetadata, SolAccount
};
use anchor_lang::AccountsClose;
use std::mem::size_of;

#[derive(Accounts)]
#[instruction( _sol_account_bump: u8, _parent_metadata_bump: u8)]
pub struct BurnV2<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_mint_account: Account<'info, Mint>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<ParentMetadata>() + 8,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        seeds = [PARENT_PDA_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub parent_metadata : Account<'info, ParentMetadata>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<SolAccount>() + 8,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        constraint = sol_account.bump == _sol_account_bump,
        seeds = [SOL_PDA_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub sol_account : Account<'info, SolAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> BurnV2<'info> {
    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.parent_mint_account.to_account_info().clone(),
            to: self.parent_token_account.to_account_info().clone(),
            authority: self.current_owner.to_account_info().clone(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<BurnV2>, _sol_account_bump: u8, _parent_metadata_bump: u8) -> Result<()> {
    ctx.accounts.parent_metadata.is_burnt = true;
    token::burn(ctx.accounts.into_burn_context(), ctx.accounts.parent_token_account.amount)?;
    ctx.accounts
            .sol_account
            .close(ctx.accounts.current_owner.to_account_info())?;
    Ok(())
}