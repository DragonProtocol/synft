use anchor_lang::prelude::*;

use crate::state::*;
use anchor_spl::token::{
    self, Mint, Token, TokenAccount, Transfer
};
use crate::state::metadata::{
    ChildType, CHILDREN_PDA_SEED, ChildrenMetadata
};


#[derive(Accounts)]
#[instruction(inject_fungible_token_amount: u64)]
pub struct InitializeFungibleTokenInject<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        init,
        payer = current_owner,
        // space: 8 discriminator + 1 reversible + 1 index + 32 pubkey + 1 bump + 4 child type
        space = 8+1+1+32+1+4,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        seeds = [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = current_owner,
        token::mint = mint,
        seeds = [SPL_TOKEN_PDA_SEED, parent_token_account.key().as_ref()], bump,
        token::authority = children_meta,
    )]
    pub fungible_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InitializeFungibleTokenInject<'info> {
    fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.owner_token_account.to_account_info().clone(),
            to: self.fungible_token_account.to_account_info().clone(),
            authority: self.current_owner.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(
    ctx: Context<InitializeFungibleTokenInject>,
    reversible: bool,
    bump: u8,
    inject_fungible_token_amount: u64,
) -> Result<()> {
    ctx.accounts.children_meta.reversible = reversible;
    ctx.accounts.children_meta.bump = bump;
    ctx.accounts.children_meta.child =
        *ctx.accounts.fungible_token_account.to_account_info().key;
    ctx.accounts.children_meta.child_type = ChildType::SPL;

    token::transfer(
        ctx.accounts.into_transfer_to_pda_context(),
        inject_fungible_token_amount,
    )?;
    Ok(())
}