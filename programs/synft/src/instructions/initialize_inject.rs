use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, SetAuthority, Token, TokenAccount, Mint
};
use spl_token::instruction::AuthorityType;
use crate::state::metadata::{
    ChildType, CHILDREN_PDA_SEED, ChildrenMetadata
};


#[derive(Accounts)]
pub struct InitializeInject<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub child_token_account: Account<'info, TokenAccount>,
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        init,
        payer = current_owner,
        // space: 8 discriminator + 1 reversible + 1 index + 32 pubkey + 1 bump + 4 child type
        space = 8+1+1+32+1+4,
        constraint = parent_token_account.amount == 1,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        seeds = [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InitializeInject<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info(),
            current_authority: self.current_owner.to_account_info(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(
    ctx: Context<InitializeInject>,
    reversible: bool,
    bump: u8,
) -> Result<()> {
    ctx.accounts.children_meta.reversible = reversible;
    ctx.accounts.children_meta.bump = bump;
    ctx.accounts.children_meta.child = *ctx.accounts.child_token_account.to_account_info().key;
    ctx.accounts.children_meta.child_type = ChildType::NFT;

    token::set_authority(
        ctx.accounts.into_set_authority_context(), // use extended priviledge from current instruction for CPI
        AuthorityType::AccountOwner,
        Some(*ctx.accounts.children_meta.to_account_info().key),
    )?;
    Ok(())
}