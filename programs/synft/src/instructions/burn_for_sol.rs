use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Mint, Token, TokenAccount, Burn
};
use crate::state::metadata::{
    ChildType, CHILDREN_PDA_SEED, ChildrenMetadata, ErrorCode
};
#[derive(Accounts)]
pub struct BurnForSol<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        // owner--> parent_token_account--> children_meta
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        seeds =  [CHILDREN_PDA_SEED, parent_token_account.key().as_ref()], 
        bump = children_meta.bump,
        close = current_owner
    )]
    children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> BurnForSol<'info> {
    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.parent_token_mint.to_account_info().clone(),
            to: self.parent_token_account.to_account_info().clone(),
            authority: self.current_owner.to_account_info().clone(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<BurnForSol>) -> Result<()> {
    if ctx.accounts.children_meta.child_type != ChildType::SOL {
        return err!(ErrorCode::InvalidBurnType);
    }
    token::burn(ctx.accounts.into_burn_context(), ctx.accounts.parent_token_account.amount)?;
    Ok(())
}