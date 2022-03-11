use anchor_lang::prelude::*;

use anchor_spl::token::{
   TokenAccount, Mint
};

use crate::state::metadata::{
    CHILDREN_PDA_SEED, ChildrenMetadata, ErrorCode
};


#[derive(Accounts)]
#[instruction(_bump: u8)]
pub struct ExtractSol<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        mut,
        // owner--> parent_mint_account--> children_meta --> chilren_token_account
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = children_meta.bump == _bump,
        seeds =  [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref()], 
        bump = children_meta.bump,
        close = current_owner
    )]
    children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<ExtractSol>, _bump: u8) -> Result<()> {
    if !ctx.accounts.children_meta.reversible {
        return err!(ErrorCode::InvalidExtractAttempt);
    }

    // close meta_data account
    Ok(())
}