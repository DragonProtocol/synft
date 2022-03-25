use crate::state::metadata::{
    ChildrenMetadataV2, CrankMetadata, ParentMetadata,
    CRANK_PDA_SEED, PARENT_PDA_SEED,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint};
use std::mem::size_of;

#[derive(Accounts)]
pub struct TransferCrankInit<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub child_mint_account: Box<Account<'info, Mint>>,
    pub parent_mint_account: Box<Account<'info, Mint>>,
    pub root_mint_account: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = children_meta_of_parent.root != parent_mint_account.key(),
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
        init_if_needed,
        payer = operator,
        space = 8 + size_of::<ParentMetadata>(),
        seeds = [PARENT_PDA_SEED, child_mint_account.key().as_ref()], bump,
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
        init,
        payer = operator,
        space = 8 + size_of::<CrankMetadata>(),
        seeds = [CRANK_PDA_SEED, child_mint_account.key().as_ref()], bump
    )]
    pub crank_meta: Box<Account<'info, CrankMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<TransferCrankInit>) -> Result<()> {
    // crank_meta
    ctx.accounts.crank_meta.old_root_meta_data =*ctx.accounts.children_meta_of_root.to_account_info().key;
    ctx.accounts.crank_meta.new_root_meta_data = *ctx.accounts.parent_meta_of_parent.to_account_info().key;
    for immediate_child in ctx.accounts.parent_meta.immediate_children.iter() {
        if !immediate_child.eq(&Pubkey::default()) {
            for not_processed_child in ctx.accounts.crank_meta.not_processed_children.iter_mut() {
                if not_processed_child.to_bytes() == Pubkey::default().to_bytes() {
                    *not_processed_child = immediate_child.clone();
                }
            }
        }
    }

    // parent_meta_of_parent
    for immediate_child in ctx.accounts.parent_meta_of_parent.immediate_children.iter_mut() {
        if immediate_child.to_bytes() == ctx.accounts.child_mint_account.key().to_bytes() {
            *immediate_child = Pubkey::default();
        }
    }
    
    // parent_meta
    ctx.accounts.parent_meta.height = 1;
    Ok(())
}
