use crate::state::metadata::{ChildType, ChildrenMetadataV2, CHILDREN_PDA_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, SetAuthority, Token, TokenAccount};
use spl_token::instruction::AuthorityType;

#[derive(Accounts)]
pub struct TransferChildNftV2<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    pub root_mint_account: Box<Account<'info, Mint>>,
    #[account(
        constraint = root_token_account.amount == 1,
        constraint = root_token_account.mint == root_mint_account.key(),
        constraint = root_token_account.owner == current_owner.key(),
    )]
    pub root_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = root_meta.parent == root_mint_account.key(),
        constraint = root_meta.root == root_meta.key(),
        constraint = root_meta.is_mutable == true,
        constraint = root_meta.is_mutated == false,
    )]
    pub root_meta: Box<Account<'info, ChildrenMetadataV2>>,
    pub parent_mint_account: Box<Account<'info, Mint>>,
    #[account(
        mut,
        constraint = parent_of_children_meta.child_type == ChildType::NFT,
        constraint = parent_of_children_meta.parent == parent_mint_account.key(),
        constraint = parent_of_children_meta.child == child_mint_account.key(),
        constraint = parent_of_children_meta.root == root_meta.key(),

    )]
    pub parent_of_children_meta: Box<Account<'info, ChildrenMetadataV2>>,
    pub child_mint_account: Box<Account<'info, Mint>>,
    #[account(
        mut,
        constraint = child_token_account.amount == 1,
        constraint = child_token_account.mint == child_mint_account.key(),
    )]
    pub child_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub receiver_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> TransferChildNftV2<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info(),
            current_authority: self.parent_of_children_meta.to_account_info(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<TransferChildNftV2>, _bump: u8) -> Result<()> {
    ctx.accounts.root_meta.is_mutated = true;
    let seeds = &[
        &CHILDREN_PDA_SEED[..],
        ctx.accounts
            .parent_mint_account
            .to_account_info()
            .key
            .as_ref(),
        ctx.accounts
            .child_mint_account
            .to_account_info()
            .key
            .as_ref(),
        &[_bump],
    ];

    token::set_authority(
        ctx.accounts
            .into_set_authority_context()
            .with_signer(&[&seeds[..]]), // use PDA as signer
        AuthorityType::AccountOwner,
        Some(*ctx.accounts.receiver_account.key),
    )?;

    // Delete parent of meta data pda account when it is not root meta data.
    // if ctx.accounts.parent_of_children_meta.key() != ctx.accounts.root_meta.key() {
    //     ctx.accounts
    //         .parent_of_children_meta
    //         .close(ctx.accounts.current_owner.to_account_info())?
    // }
    ctx.accounts.parent_of_children_meta.is_mutated = true;

    Ok(())
}
