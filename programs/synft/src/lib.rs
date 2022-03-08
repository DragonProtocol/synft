use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, SetAuthority, Token, TokenAccount, Transfer}; // Transfer,CloseAccount, Mint
use solana_program::program::invoke;
use solana_program::system_instruction;
use spl_token::instruction::AuthorityType;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
const CHILDREN_PDA_SEED: &[u8] = b"children-of";
const SPL_TOKEN_PDA_SEED: &[u8] = b"fungible-token-seed";
const SOL_PDA_SEED: &[u8] = b"sol-seed";

#[program]
pub mod synft {
    use super::*;

    pub fn initialize_inject(
        ctx: Context<InitializeInject>,
        reversible: bool,
        bump: u8,
    ) -> Result<()> {
        ctx.accounts.children_meta.reversible = reversible;
        ctx.accounts.children_meta.bump = bump;
        ctx.accounts.children_meta.child = *ctx.accounts.child_token_account.to_account_info().key;
        ctx.accounts.children_meta.child_type = ChildType::NFT;
        let parent_key = ctx
            .accounts
            .parent_token_account
            .to_account_info()
            .key
            .as_ref();

        let (_, children_pda_bump) =
            Pubkey::find_program_address(&[&CHILDREN_PDA_SEED[..], parent_key], &(ctx.program_id));
        if bump != children_pda_bump {
            return err!(ErrorCode::InvalidMetadataBump);
        }

        token::set_authority(
            ctx.accounts.into_set_authority_context(), // use extended priviledge from current instruction for CPI
            AuthorityType::AccountOwner,
            Some(*ctx.accounts.children_meta.to_account_info().key),
        )?;
        Ok(())
    }

    pub fn initialize_fungible_token_inject(
        ctx: Context<InitializeFungibleTokenInject>,
        reversible: bool,
        bump: u8,
        inject_fungible_token_amount: u64,
    ) -> Result<()> {
        ctx.accounts.children_meta.reversible = reversible;
        ctx.accounts.children_meta.bump = bump;
        ctx.accounts.children_meta.child =
            *ctx.accounts.fungible_token_account.to_account_info().key;
        ctx.accounts.children_meta.child_type = ChildType::SPL;

        let parent_key = ctx
            .accounts
            .parent_token_account
            .to_account_info()
            .key
            .as_ref();
        let (_, children_pda_bump) =
            Pubkey::find_program_address(&[&CHILDREN_PDA_SEED[..], parent_key], &(ctx.program_id));
        if bump != children_pda_bump {
            return err!(ErrorCode::InvalidMetadataBump);
        }

        token::transfer(
            ctx.accounts.into_transfer_to_pda_context(),
            inject_fungible_token_amount,
        )?;
        Ok(())
    }

    pub fn initialize_sol_inject(
        ctx: Context<InitializeSolInject>,
        reversible: bool,
        bump: u8,
        inject_sol_amount: u64,
    ) -> Result<()> {
        ctx.accounts.children_meta.reversible = reversible;
        ctx.accounts.children_meta.bump = bump;
        ctx.accounts.children_meta.child = *ctx.accounts.sol_token_account.to_account_info().key;
        ctx.accounts.children_meta.child_type = ChildType::SOL;

        let parent_key = ctx
            .accounts
            .parent_token_account
            .to_account_info()
            .key
            .as_ref();
        let (_, children_pda_bump) =
            Pubkey::find_program_address(&[&CHILDREN_PDA_SEED[..], parent_key], &(ctx.program_id));
        if bump != children_pda_bump {
            return err!(ErrorCode::InvalidMetadataBump);
        }

        invoke(
            &system_instruction::transfer(
                ctx.accounts.current_owner.key,
                ctx.accounts.sol_token_account.key,
                inject_sol_amount, // 0.1 SOL
            ),
            &[
                ctx.accounts.current_owner.to_account_info(),
                ctx.accounts.sol_token_account.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;
        Ok(())
    }

    pub fn extract(ctx: Context<Extract>, _bump: u8) -> Result<()> {
        if !ctx.accounts.children_meta.reversible {
            return err!(ErrorCode::InvalidExtractAttempt);
        }
        let seeds = &[
            &CHILDREN_PDA_SEED[..],
            ctx.accounts
                .parent_token_account
                .to_account_info()
                .key
                .as_ref(),
            &[_bump],
        ];

        // assign token from PDA to signer
        token::set_authority(
            ctx.accounts
                .into_set_authority_context()
                .with_signer(&[&seeds[..]]), // use PDA as signer
            AuthorityType::AccountOwner,
            Some(*ctx.accounts.current_owner.to_account_info().key),
        )?;

        // close meta_data account
        Ok(())
    }

    pub fn extract_sol(ctx: Context<ExtractSol>, _bump: u8) -> Result<()> {
        if !ctx.accounts.children_meta.reversible {
            return err!(ErrorCode::InvalidExtractAttempt);
        }
        let src: &mut AccountInfo = &mut ctx.accounts.child_sol_account.to_account_info();
        let dst: &mut AccountInfo = &mut ctx.accounts.current_owner.to_account_info();
        let amount = src.lamports();
        **src.try_borrow_mut_lamports()? = src
            .lamports()
            .checked_sub(amount)
            .ok_or(ProgramError::InvalidArgument)?;
        **dst.try_borrow_mut_lamports()? = dst
            .lamports()
            .checked_add(amount)
            .ok_or(ProgramError::InvalidArgument)?;

        // close meta_data account
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeInject<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub child_token_account: Account<'info, TokenAccount>,
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = current_owner,
        // space: 8 discriminator + 1 reversible + 1 index + 32 pubkey + 1 bump + 4 child type
        space = 8+1+1+32+1+4,
        seeds = [CHILDREN_PDA_SEED, parent_token_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InitializeInject<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info(),
            current_authority: self.current_owner.to_account_info(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[derive(Accounts)]
#[instruction(inject_fungible_token_amount: u64)]
pub struct InitializeFungibleTokenInject<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = current_owner,
        // space: 8 discriminator + 1 reversible + 1 index + 32 pubkey + 1 bump + 4 child type
        space = 8+1+1+32+1+4,
        seeds = [CHILDREN_PDA_SEED, parent_token_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = current_owner,
        token::mint = mint,
        seeds = [SPL_TOKEN_PDA_SEED, parent_token_account.key().as_ref()], bump,
        token::authority = children_meta,
    )]
    pub fungible_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> InitializeFungibleTokenInject<'info> {
    fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.owner_token_account.to_account_info().clone(),
            to: self.fungible_token_account.to_account_info().clone(),
            authority: self.current_owner.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct InitializeSolInject<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = current_owner,
        // space: 8 discriminator + 1 reversible + 1 index + 32 pubkey + 1 bump + 4 child type
        space = 8+1+1+32+1+4,
        seeds = [CHILDREN_PDA_SEED, parent_token_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadata>>,
    #[account(
        init,
        payer = current_owner, space = 8,
        seeds = [SOL_PDA_SEED, parent_token_account.key().as_ref()], bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub sol_token_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(_bump: u8)]
pub struct Extract<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub child_token_account: Account<'info, TokenAccount>,
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = children_meta.child == *child_token_account.to_account_info().key,
        constraint = children_meta.bump == _bump,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        close = current_owner
    )]
    children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

impl<'info> Extract<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info().clone(),
            current_authority: self.children_meta.to_account_info().clone(), // PDA
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct ExtractSol<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub child_sol_account: AccountInfo<'info>,
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = children_meta.child == *child_sol_account.to_account_info().key,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        close = current_owner
    )]
    children_meta: Box<Account<'info, ChildrenMetadata>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct ChildrenMetadata {
    pub reversible: bool,
    pub child: Pubkey,
    // children is found via filtering their authority (1 to many)
    // [ "childrenOf", pubkey, metaDataIndex ]
    pub child_type: ChildType,
    bump: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy)]
pub enum ChildType {
    SOL,
    SPL,
    NFT,
}

#[account]
pub struct ParentMetadata {
    pub parent: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The bump passed in does not match the bump in the PDA")]
    InvalidMetadataBump,
    #[msg("Current owner is not the authority of the parent token")]
    InvalidAuthority,
    #[msg("Only Reversible Synthetic Tokens can be extracted")]
    InvalidExtractAttempt,
}
