use crate::state::metadata::{ChildType, ChildrenMetadataV2, CHILDREN_PDA_SEED, ParentMetadata, PARENT_PDA_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, SetAuthority, Token, TokenAccount};
use spl_token::instruction::AuthorityType;
use std::mem::size_of;

#[derive(Accounts)]
pub struct InjectToRootV2<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(
        mut,
        constraint = child_token_account.amount == 1,
        constraint = child_token_account.mint == child_mint_account.key(),
        constraint = child_token_account.owner == current_owner.key(),
    )]
    pub child_token_account: Account<'info, TokenAccount>,
    pub child_mint_account: Account<'info, Mint>,
    #[account(
        constraint = parent_token_account.amount == 1,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        constraint = parent_token_account.owner == current_owner.key(),
    )]
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        init,
        payer = current_owner,
        space = 8 + size_of::<ChildrenMetadataV2>(),
        seeds = [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref(), child_mint_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadataV2>>,
    #[account(
        init_if_needed, 
        payer = current_owner,
        space = 8 + size_of::<ParentMetadata>(),
        seeds = [PARENT_PDA_SEED, parent_mint_account.key().as_ref()], bump
    )]
    pub parent_meta: Box<Account<'info, ParentMetadata>>,

    #[account(
        init, 
        payer = current_owner,
        space = 8 + size_of::<ParentMetadata>(),
        seeds = [PARENT_PDA_SEED, child_mint_account.key().as_ref()], bump,
    )]
    pub parent_meta_of_child: Box<Account<'info, ParentMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InjectToRootV2<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info(),
            current_authority: self.current_owner.to_account_info(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<InjectToRootV2>, is_mutable: bool, child_meta_bump: u8, parent_mata_bump: u8, parent_mata_of_child_bump: u8) -> Result<()> {
    ctx.accounts.children_meta.is_mutable = is_mutable;
    ctx.accounts.children_meta.bump = child_meta_bump;
    ctx.accounts.children_meta.child = *ctx.accounts.child_mint_account.to_account_info().key;
    ctx.accounts.children_meta.parent = *ctx.accounts.parent_mint_account.to_account_info().key;
    ctx.accounts.children_meta.root = *ctx.accounts.children_meta.to_account_info().key;
    ctx.accounts.children_meta.child_type = ChildType::NFT;

    for child in ctx.accounts.parent_meta.immediate_children.iter_mut() {
        if child.to_bytes() == Pubkey::default().to_bytes() {
            *child = *ctx.accounts.child_mint_account.to_account_info().key;
            break;
        }
    }
    ctx.accounts.parent_meta.height = 1;
    ctx.accounts.parent_meta.is_burnt = false;
    ctx.accounts.parent_meta.bump = parent_mata_bump;
    ctx.accounts.parent_meta.self_mint = *ctx.accounts.parent_mint_account.to_account_info().key;

    ctx.accounts.parent_meta_of_child.height = 2;
    ctx.accounts.parent_meta_of_child.is_burnt = false;
    ctx.accounts.parent_meta_of_child.bump = parent_mata_of_child_bump;
    ctx.accounts.parent_meta_of_child.self_mint = *ctx.accounts.parent_meta_of_child.to_account_info().key;

    token::set_authority(
        ctx.accounts.into_set_authority_context(), // use extended priviledge from current instruction for CPI
        AuthorityType::AccountOwner,
        Some(*ctx.accounts.children_meta.to_account_info().key),
    )?;
    Ok(())
}