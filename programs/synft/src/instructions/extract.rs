use anchor_lang::prelude::*;

use anchor_spl::token::{
    self, SetAuthority, Token, TokenAccount,
};
use spl_token::instruction::AuthorityType;

use crate::state::metadata::{
    CHILDREN_PDA_SEED, ChildrenMetadata, ErrorCode
};



#[derive(Accounts)]
#[instruction(_bump: u8)]
pub struct Extract<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub child_token_account: Account<'info, TokenAccount>,
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        // owner--> parent_token_account--> children_meta --> chilren_token_account
        constraint = children_meta.child == *child_token_account.to_account_info().key,
        constraint = children_meta.bump == _bump,
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

impl<'info> Extract<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info().clone(),
            current_authority: self.children_meta.to_account_info().clone(), // PDA
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<Extract>, _bump: u8) -> Result<()> {
    if !ctx.accounts.children_meta.reversible {
        return err!(ErrorCode::InvalidExtractAttempt);
    }
    let seeds = &[
        &CHILDREN_PDA_SEED[..],
        ctx.accounts
            .parent_token_account
            .to_account_info()
            .key
            .as_ref(),
        &[_bump],
    ];

    // assign token from PDA to signer
    token::set_authority(
        ctx.accounts
            .into_set_authority_context()
            .with_signer(&[&seeds[..]]), // use PDA as signer
        AuthorityType::AccountOwner,
        Some(*ctx.accounts.current_owner.to_account_info().key),
    )?;

    // close meta_data account
    Ok(())
}