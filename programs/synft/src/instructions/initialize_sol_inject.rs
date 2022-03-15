use anchor_lang::prelude::*;

use anchor_spl::token::{
    TokenAccount, Mint
};
use solana_program::program::invoke;
use solana_program::system_instruction;

use crate::state::metadata::{
    ChildType, CHILDREN_PDA_SEED, ChildrenMetadata
};


#[derive(Accounts)]
pub struct InitializeSolInject<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    pub parent_mint_account: Account<'info, Mint>,
    #[account(
        init,
        payer = current_owner,
        // space: 8 discriminator + 1 reversible + 1 index + 32 pubkey + 1 bump + 4 child type
        space = 8+1+1+32+1+4,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        seeds = [CHILDREN_PDA_SEED, parent_mint_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeSolInject>,
    reversible: bool,
    bump: u8,
    inject_sol_amount: u64,
) -> Result<()> {
    ctx.accounts.children_meta.reversible = reversible;
    ctx.accounts.children_meta.bump = bump;
    ctx.accounts.children_meta.child_type = ChildType::SOL;

    invoke(
        &system_instruction::transfer(
            ctx.accounts.current_owner.key,
            ctx.accounts.children_meta.to_account_info().key,
            inject_sol_amount, // 0.1 SOL
        ),
        &[
            ctx.accounts.current_owner.to_account_info(),
            ctx.accounts.children_meta.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;
    Ok(())
}