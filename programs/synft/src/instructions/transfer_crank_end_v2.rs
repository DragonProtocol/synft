use crate::state::metadata::{ChildrenMetadataV2, CrankMetadata, ErrorCode, ParentMetadata};
use anchor_lang::prelude::*;
use anchor_lang::AccountsClose;

#[derive(Accounts)]
pub struct TransferCrankEnd<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    #[account(
        mut,
        constraint = children_meta_of_root.root == children_meta_of_root.key(),
        constraint = children_meta_of_root.is_mutable == true,
        constraint = children_meta_of_root.is_mutated == true,
    )]
    pub children_meta_of_root: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
        mut,
        constraint = crank_meta.closed_children_meta_data == children_meta_of_close.key(),
    )]
    pub children_meta_of_close: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
       mut,
        constraint = parent_meta.is_burnt == false,
    )]
    pub parent_meta: Box<Account<'info, ParentMetadata>>,
    #[account(
        mut,
        constraint = crank_meta.old_children_root_meta_data == children_meta_of_root.key(),
        constraint = !crank_meta.has_children(),
    )]
    pub crank_meta: Box<Account<'info, CrankMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<TransferCrankEnd>) -> Result<()> {
    if ctx.accounts.parent_meta.has_children() {
        return err!(ErrorCode::InvalidTransferCrankEnd);
    }

    ctx.accounts.children_meta_of_root.is_mutated = false;
    ctx.accounts
        .crank_meta
        .close(ctx.accounts.operator.to_account_info())?;
    ctx.accounts
        .children_meta_of_close
        .close(ctx.accounts.operator.to_account_info())?;
    Ok(())
}
