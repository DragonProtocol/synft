use anchor_lang::prelude::*;

use anchor_spl::token::{
    self, Mint, SetAuthority, Token, TokenAccount, Burn
};
use spl_token::instruction::AuthorityType;
use crate::state::metadata::{
    ChildType, CHILDREN_PDA_SEED, ChildrenMetadataV2, ErrorCode
};
#[derive(Accounts)]
pub struct BurnForTokenV2<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_mint_account: Account<'info, Mint>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub child_mint_account: Account<'info, Mint>,
    #[account(mut)]
    pub child_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        // owner--> parent_token_account--> children_meta --> chilren_token_account
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = children_meta.child == *child_mint_account.to_account_info().key,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        seeds =  [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref(), child_mint_account.key().as_ref()], 
        bump = children_meta.bump,
        close = current_owner
    )]
    children_meta: Box<Account<'info, ChildrenMetadataV2>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> BurnForTokenV2<'info> {
    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.parent_mint_account.to_account_info().clone(),
            to: self.parent_token_account.to_account_info().clone(),
            authority: self.current_owner.to_account_info().clone(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info().clone(),
            current_authority: self.children_meta.to_account_info().clone(), // PDA
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<BurnForTokenV2>) -> Result<()> {
    if ctx.accounts.children_meta.child_type == ChildType::SOL {
        return err!(ErrorCode::InvalidBurnType);
    }

    ctx.accounts.children_meta.is_mutated = true;
    token::burn(ctx.accounts.into_burn_context(), ctx.accounts.parent_token_account.amount)?;

    let seeds = &[
        &CHILDREN_PDA_SEED[..],
        ctx.accounts
            .parent_mint_account
            .to_account_info()
            .key
            .as_ref(),
        ctx.accounts
            .child_mint_account
            .to_account_info()
            .key
            .as_ref(),
        &[ctx.accounts.children_meta.bump],
    ];
    token::set_authority(ctx.accounts.into_set_authority_context().with_signer(&[&seeds[..]]), // use PDA as signer
        AuthorityType::AccountOwner, Some(*ctx.accounts.current_owner.key))?;
        // TODO: deal with SPL burn separately using associated token program
    Ok(())
}