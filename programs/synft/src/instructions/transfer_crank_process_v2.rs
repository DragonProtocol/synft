use crate::state::metadata::{
    ChildrenMetadataV2, CrankMetadata, ErrorCode, ParentMetadata, CHILDREN_PDA_SEED,
};
use anchor_lang::prelude::*;
use anchor_lang::AccountsClose;
use anchor_spl::token::{Mint};
use std::mem::size_of;

#[derive(Accounts)]
pub struct TransferCrankProcess<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    pub child_mint_account: Account<'info, Mint>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = operator,
        space = 8 + size_of::<ChildrenMetadataV2>(),
        seeds = [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref(), child_mint_account.key().as_ref()], bump,
        constraint = children_meta.root == children_meta_of_root.key(),
        constraint = children_meta_of_parent.is_mutated == false,
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
        mut,
        constraint = children_meta_of_parent.root == children_meta_of_root.key(),
        constraint = children_meta_of_parent.is_mutated == true,
    )]
    pub children_meta_of_parent: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
        mut,
        constraint = children_meta_of_root.root == children_meta_of_root.key(),
        constraint = children_meta_of_root.is_mutable == true,
        constraint = children_meta_of_root.is_mutated == true,
    )]
    pub children_meta_of_root: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
       mut,
        constraint = parent_meta.is_burnt == false,
    )]
    pub parent_meta: Box<Account<'info, ParentMetadata>>,
    #[account(
        mut,
        constraint = parent_meta_of_parent.is_burnt == false,
    )]
    pub parent_meta_of_parent: Box<Account<'info, ParentMetadata>>,
    #[account(
        mut,
        constraint = parent_meta_of_root.is_burnt == false,
    )]
    pub parent_meta_of_root: Box<Account<'info, ParentMetadata>>,
    #[account(
        mut,
        constraint = crank_meta.old_root_meta_data == children_meta_of_root.key(),
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
        .contains(&ctx.accounts.children_meta.to_account_info().key)
    {
        return err!(ErrorCode::InvalidTransferCrank);
    }

    // update meta data
    ctx.accounts.children_meta.root = ctx.accounts.crank_meta.new_root_meta_data;
    ctx.accounts.children_meta.is_mutated = true;
    ctx.accounts.children_meta_of_parent.is_mutated = false;
    ctx.accounts.parent_meta.height = ctx.accounts.parent_meta_of_parent.height + 1;

    // process leaf or non-leaf
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
    } else {
        ctx.accounts
            .children_meta
            .close(ctx.accounts.operator.to_account_info())?;
        ctx.accounts
            .parent_meta
            .close(ctx.accounts.operator.to_account_info())?;
    }

    // end
    if !ctx.accounts.crank_meta.has_children() {
        ctx.accounts.children_meta_of_root.is_mutated = false;
        ctx.accounts
            .crank_meta
            .close(ctx.accounts.operator.to_account_info())?;
    }
    Ok(())
}
