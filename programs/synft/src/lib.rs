use anchor_lang::prelude::*;
use anchor_spl::token::{self, SetAuthority, TokenAccount}; // Transfer,CloseAccount, Mint
use spl_token::instruction::AuthorityType;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
const CHILDREN_PDA_SEED: &[u8] = b"children-of";
#[program]
pub mod synft {
    use super::*;

    pub fn initialize_inject(
        ctx: Context<InitializeInject>,
        reversable: bool,
        bump: u8,
    ) -> Result<()> {
        ctx.accounts.children_meta.reversable = reversable;
        ctx.accounts.children_meta.bump = bump;
        ctx.accounts.children_meta.child = *ctx.accounts.child_token_account.to_account_info().key;
        let parent_key = ctx
            .accounts
            .parent_token_account
            .to_account_info()
            .key
            .as_ref();
        // TODO: support both SPL and NFT later
        let (_, pda_bump) =
            Pubkey::find_program_address(&[&CHILDREN_PDA_SEED[..], parent_key], &(ctx.program_id));
        if bump != pda_bump {
            return err!(ErrorCode::InvalidMetadataBump);
        }

        token::set_authority(
            ctx.accounts.into_set_authority_context(), // use exended priviledge from current instruction for CPI
            AuthorityType::AccountOwner,
            Some(*ctx.accounts.children_meta.to_account_info().key),
        )?;
        Ok(())
    }

    pub fn inject(_ctx: Context<Inject>) -> Result<()> {
        // TODO: adding more NFTs and SPLs to the children_metadata
        Ok(())
    }

    pub fn extract(ctx: Context<Extract>, _bump: u8) -> Result<()> {
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
        // space: 8 discriminator + 1 reversable + 1 index + 32 pubkey + 1 bump
        space = 8+1+1+32+1,
        seeds = [CHILDREN_PDA_SEED, parent_token_account.key().as_ref()], bump
    )]
    pub children_meta: Box<Account<'info, ChildrenMetadata>>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

impl<'info> InitializeInject<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info(),
            current_authority: self.current_owner.to_account_info(),
        };

        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

#[derive(Accounts)]
pub struct Inject {
    // TODO: this is not necessary for now
// will use this to Support both SPL and NFT later
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

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

impl<'info> Extract<'info> {
    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.child_token_account.to_account_info().clone(),
            current_authority: self.children_meta.to_account_info().clone(), // PDA
        };

        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}

#[account]
pub struct ChildrenMetadata {
    pub reversable: bool,
    pub child: Pubkey, // children is found via filtering their authority (1 to many)
    // [ "childrenOf", pubkey, metaDataIndex ]
    bump: u8,
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
}
