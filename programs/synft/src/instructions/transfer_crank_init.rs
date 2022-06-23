use crate::state::metadata::{
    ChildrenMetadata, CrankMetadata, ParentMetadata, CRANK_PDA_SEED, PARENT_PDA_SEED,
};
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use std::mem::size_of;

#[derive(Accounts)]
pub struct TransferCrankInit<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub child_mint_account: Account<'info, Mint>,
    #[account(
        mut,
        constraint = children_meta_of_parent.root == children_meta_of_root.key(),
        constraint = children_meta_of_parent.is_mutated == true,
        constraint = children_meta_of_parent.child == child_mint_account.key(),
    )]
    pub children_meta_of_parent: Account<'info, ChildrenMetadata>,
    #[account(
        mut,
        constraint = children_meta_of_root.root == children_meta_of_root.key(),
        constraint = children_meta_of_root.is_mutable == true,
        constraint = children_meta_of_root.is_mutated == true,
    )]
    pub children_meta_of_root: Account<'info, ChildrenMetadata>,
    #[account(
        init_if_needed,
        payer = operator,
        space = 8 + size_of::<ParentMetadata>(),
        seeds = [PARENT_PDA_SEED, child_mint_account.key().as_ref()], bump,
    )]
    pub parent_meta: Box<Account<'info, ParentMetadata>>,
    #[account(mut)]
    pub parent_meta_of_parent: Box<Account<'info, ParentMetadata>>,
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
    // set crank meta data
    ctx.accounts.crank_meta.old_children_root_meta_data =
        *ctx.accounts.children_meta_of_root.to_account_info().key;
    ctx.accounts.crank_meta.closed_children_meta_data =
        *ctx.accounts.children_meta_of_parent.to_account_info().key;
    ctx.accounts.crank_meta.tranfered_nft = 
        *ctx.accounts.child_mint_account.to_account_info().key;
    for immediate_child in ctx.accounts.parent_meta.immediate_children.iter() {
        if !immediate_child.eq(&Pubkey::default()) {
            for not_processed_child in ctx.accounts.crank_meta.not_processed_children.iter_mut() {
                if not_processed_child.to_bytes() == Pubkey::default().to_bytes() {
                    *not_processed_child = immediate_child.clone();
                    break;
                }
            }
        }
    }

    // remove child in parent meta data 
    for immediate_child in ctx
        .accounts
        .parent_meta_of_parent
        .immediate_children
        .iter_mut()
    {
        if immediate_child.to_bytes() == ctx.accounts.child_mint_account.key().to_bytes() {
            *immediate_child = Pubkey::default();
        }
    }
    // set parent meta data
    ctx.accounts.parent_meta.height = 1;
    Ok(())
}
