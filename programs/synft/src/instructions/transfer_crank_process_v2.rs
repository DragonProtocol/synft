use crate::state::metadata::{
    ChildrenMetadataV2, CrankMetadata, ErrorCode, ParentMetadata,
};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

#[derive(Accounts)]
pub struct TransferCrankProcess<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    pub child_mint_account: Account<'info, Mint>,
    #[account(
        mut,
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
       mut,
    )]
    pub parent_meta: Box<Account<'info, ParentMetadata>>,
    #[account(
        mut,
    )]
    pub parent_meta_of_parent: Box<Account<'info, ParentMetadata>>,
    #[account(
        mut,
    )]
    pub crank_meta: Box<Account<'info, CrankMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<TransferCrankProcess>) -> Result<()> {
    if !ctx
        .accounts
        .crank_meta
        .not_processed_children
        .contains(&ctx.accounts.child_mint_account.to_account_info().key)
    {
        return err!(ErrorCode::InvalidTransferCrankProcess);
    }

    // only for three levels
    ctx.accounts.children_meta.root = *ctx.accounts.children_meta.to_account_info().key;
    ctx.accounts.parent_meta.height = ctx.accounts.parent_meta_of_parent.height + 1;

    if ctx.accounts.parent_meta.has_children() {
        for immediate_child in ctx.accounts.parent_meta.immediate_children.iter() {
            if !immediate_child.eq(&Pubkey::default()) {
                for not_processed_child in ctx.accounts.crank_meta.not_processed_children.iter_mut()
                {
                    if not_processed_child.to_bytes() == Pubkey::default().to_bytes() {
                        *not_processed_child = immediate_child.clone();
                    }
                }
            }
        }
    }
    Ok(())
}
