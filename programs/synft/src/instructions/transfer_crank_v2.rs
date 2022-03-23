use crate::state::metadata::{
    ChildrenMetadataV2, CrankMetadata, ParentMetadata, CHILDREN_PDA_SEED, CRANK_PDA_SEED,
    PARENT_PDA_SEED,
};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};
use std::mem::size_of;

#[derive(Accounts)]
pub struct TransferCrank<'info> {
    #[account(mut)]
    pub operator: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub current_owner: AccountInfo<'info>,
    #[account(
        mut,
        constraint = child_token_account.amount == 1,
        constraint = child_token_account.mint == child_mint_account.key(),
        constraint = child_token_account.owner == current_owner.key(),
    )]
    pub child_token_account: Box<Account<'info, TokenAccount>>,
    pub child_mint_account: Box<Account<'info, Mint>>,
    #[account(
        constraint = parent_token_account.amount == 1,
        constraint = parent_token_account.mint == parent_mint_account.key(),
    )]
    pub parent_token_account: Box<Account<'info, TokenAccount>>,
    pub parent_mint_account: Box<Account<'info, Mint>>,
    #[account(
        constraint = root_token_account.amount == 1,
        constraint = root_token_account.mint == root_mint_account.key(),
        constraint = root_token_account.owner == current_owner.key(),
    )]
    pub root_token_account: Box<Account<'info, TokenAccount>>,
    pub root_mint_account: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = operator,
        space = 8 + size_of::<ChildrenMetadataV2>(),
        seeds = [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref(), child_mint_account.key().as_ref()], bump,
        constraint = children_meta.root == root_meta.key(),
        constraint = children_meta_of_parent.is_mutated == false,
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
        constraint = children_meta_of_parent.root != parent_mint_account.key(),
        constraint = children_meta_of_parent.root == root_meta.key(),
        constraint = children_meta_of_parent.is_mutated == true,
    )]
    pub children_meta_of_parent: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
        constraint = root_meta.root == root_meta.key(),
        constraint = root_meta.is_mutable == true,
        constraint = root_meta.is_mutated == true,
    )]
    pub root_meta: Box<Account<'info, ChildrenMetadataV2>>,
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
        constraint = parent_meta.is_burnt == false,
    )]
    pub parent_meta_of_parent: Box<Account<'info, ParentMetadata>>,
    #[account(
        mut,
        constraint = parent_meta_of_root.is_burnt == false,
    )]
    pub parent_meta_of_root: Box<Account<'info, ParentMetadata>>,
    #[account(
        init_if_needed,
        payer = operator,
        space = 8 + size_of::<CrankMetadata>(),
        seeds = [CRANK_PDA_SEED, child_mint_account.key().as_ref()], bump
    )]
    pub crank_meta: Box<Account<'info, CrankMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(_ctx: Context<TransferCrank>) -> Result<()> {
    // TODO
    // 判断是否是crank_meta init
    // 设置children_meta的root、parent
    // 设置crank_meta 属性数据
    // 层高设置为1
    // close children_meta_of_parent
    // 否则判断child_mint_account是否在crank_meta的not_processed_children里面
    // 设置children_meta的root
    // 层高设置上一层+1
    // 判断是否是叶子节点（根据children_meta、parent_meta是否为空判断）
    // 添加parent meta中的children数据到crank_meta的not_processed_children里面
    // 否则判断crank_meta的not_processed_children 是否为空
    // 修改rootmeta的is_mutated为false
    Ok(())
}
