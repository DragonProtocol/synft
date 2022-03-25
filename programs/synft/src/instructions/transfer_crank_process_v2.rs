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
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        mut,
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
        return err!(ErrorCode::InvalidTransferCrankProcess);
    }

    ctx.accounts.children_meta.root = ctx.accounts.crank_meta.new_root_meta_data;
    ctx.accounts.children_meta.is_mutated = true;
    ctx.accounts.children_meta_of_parent.is_mutated = false;
    ctx.accounts.children_meta_of_parent.root = ctx.accounts.crank_meta.new_root_meta_data;
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
