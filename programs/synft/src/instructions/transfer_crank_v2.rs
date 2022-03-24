use crate::state::metadata::{
    ChildrenMetadataV2, CrankMetadata, ErrorCode, ParentMetadata, CHILDREN_PDA_SEED,
    CRANK_PDA_SEED, PARENT_PDA_SEED, PLACEHOLDER_PUBKEY,
};
use anchor_lang::prelude::*;
use anchor_lang::AccountsClose;
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
        constraint = parent_meta_of_parent.is_burnt == false,
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

pub fn handler(ctx: Context<TransferCrank>) -> Result<()> {
    // TODO
    //1.init 判断是否是crank_meta init
    let mut is_crank_meta_inited: bool = false;
    for child in ctx.accounts.parent_meta.immediate_children.iter_mut() {
        if child.to_bytes() != PLACEHOLDER_PUBKEY.to_bytes() {
            is_crank_meta_inited = true;
            break;
        }
    }
    if !is_crank_meta_inited {
        // a 设置children_meta的root、parent
        ctx.accounts.children_meta.parent = *ctx.accounts.parent_mint_account.to_account_info().key;
        ctx.accounts.children_meta.root = *ctx.accounts.children_meta.to_account_info().key;
        ctx.accounts.children_meta.is_mutated = false;
        // b 设置crank_meta 属性数据
        ctx.accounts.crank_meta.old_root_meta_data = *ctx.accounts.root_meta.to_account_info().key;
        ctx.accounts.crank_meta.new_root_meta_data = *ctx.accounts.children_meta.to_account_info().key;
        ctx.accounts.crank_meta.not_processed_children = [PLACEHOLDER_PUBKEY; 32];
        for immediate_child in ctx.accounts.parent_meta.immediate_children.iter_mut() {
            if immediate_child.to_bytes() != PLACEHOLDER_PUBKEY.to_bytes() {
                for not_processed_child in ctx.accounts.crank_meta.not_processed_children.iter_mut()
                {
                    if not_processed_child.to_bytes() == PLACEHOLDER_PUBKEY.to_bytes() {
                        *not_processed_child = immediate_child.clone();
                    }
                }
            }
        }
        // c 层高设置为1
        ctx.accounts.parent_meta.height = 1;
        // d close children_meta_of_parent
        ctx.accounts
            .children_meta_of_parent
            .close(ctx.accounts.operator.to_account_info())?;
        return Ok(());
    }

    //2. process 否则判断child_mint_account是否在crank_meta的not_processed_children里面
    let mut is_in_processed_children: bool = false;
    for not_processed_child in ctx.accounts.crank_meta.not_processed_children.iter_mut() {
        if not_processed_child.to_bytes()
            == ctx.accounts.children_meta.to_account_info().key.to_bytes()
        {
            is_in_processed_children = true;
            break;
        }
    }
    if !is_in_processed_children {
        return err!(ErrorCode::InvalidTransferCrank);
    }
    // a 设置children_meta的root
    ctx.accounts.children_meta.root = ctx.accounts.crank_meta.new_root_meta_data;
    // b 层高设置上一层+1
    ctx.accounts.parent_meta.height = ctx.accounts.parent_meta_of_parent.height + 1;
    ctx.accounts.children_meta_of_parent.is_mutated = false;
    ctx.accounts.children_meta.is_mutated = true;
    //3.判断是否是叶子节点（根据parent_meta是否为空判断）
    let mut is_leaf: bool = false;
    for immediate_child in ctx.accounts.parent_meta.immediate_children.iter_mut() {
        if immediate_child.to_bytes() == PLACEHOLDER_PUBKEY.to_bytes() {
            is_leaf = false;
            break;
        }
    }
    if is_leaf {
        ctx.accounts
            .children_meta
            .close(ctx.accounts.operator.to_account_info())?;
        ctx.accounts
            .parent_meta
            .close(ctx.accounts.operator.to_account_info())?;
    } else {
        // a 添加parent meta中的children数据到crank_meta的not_processed_children里面
        for immediate_child in ctx.accounts.parent_meta.immediate_children.iter_mut() {
            if immediate_child.to_bytes() != PLACEHOLDER_PUBKEY.to_bytes() {
                for not_processed_child in ctx.accounts.crank_meta.not_processed_children.iter_mut()
                {
                    if not_processed_child.to_bytes() == PLACEHOLDER_PUBKEY.to_bytes() {
                        *not_processed_child = immediate_child.clone();
                    }
                }
            }
        }
    }
    //4.判断crank_meta的not_processed_children 是否为空
    let mut is_processed_children_empty: bool = true;
    for not_processed_child in ctx.accounts.crank_meta.not_processed_children.iter_mut() {
        if not_processed_child.to_bytes() != PLACEHOLDER_PUBKEY.to_bytes() {
            is_processed_children_empty = false;
            break;
        }
    }
    if is_processed_children_empty {
        // a 修改rootmeta的is_mutated为false
        ctx.accounts.root_meta.is_mutated = false;
        // b close crank_meta
        ctx.accounts
        .crank_meta
        .close(ctx.accounts.operator.to_account_info())?;
    }
    Ok(())
}
