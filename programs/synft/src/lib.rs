use anchor_lang::prelude::*;
use anchor_spl::token::{self, SetAuthority, TokenAccount}; //, Transfer,CloseAccount, Mint
use spl_token::instruction::AuthorityType;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod synft {
    use super::*;

    const CHILDREN_PDA_SEED: &[u8] = b"children-of";

    pub fn initialize_inject(
        ctx: Context<InitializeInject>,
        reversable: bool,
        bump: u8,
    ) -> Result<()> {
        ctx.accounts.children_meta.reversable = reversable;
        ctx.accounts.children_meta.bump = bump;
        ctx.accounts.children_meta.child = *ctx.accounts.child_account.to_account_info().key;
        let parent_key = ctx.accounts.parent_account.to_account_info().key.as_ref();
        // TODO: support both SPL and NFT later
        let (children_meta_pda, pda_bump) = Pubkey::find_program_address(
            &[&CHILDREN_PDA_SEED[..], parent_key, &[bump]],
            &(ctx.program_id),
        );
        if bump != pda_bump {
            return err!(ErrorCode::InvalidMetadataBump);
        }

        // assign token to PDA
        token::set_authority(
            ctx.accounts.into_set_authority_context(),
            AuthorityType::AccountOwner,
            Some(children_meta_pda),
        )?;

        Ok(())
    }

    pub fn inject(_ctx: Context<Inject>) -> Result<()> {
        // TODO
        Ok(())
    }

    pub fn extract(_ctx: Context<Extract>) -> Result<()> {
        // TODO
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeInject<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    pub child_account: Account<'info, TokenAccount>,
    pub parent_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = current_owner,
        // space: 8 discriminator + 1 reversable + 1 index + 32 pubkey + 1 bump
        space = 8+1+1+32+1,
        seeds = [b"children-of", parent_account.key().as_ref()], bump
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
            account_or_mint: self.child_account.to_account_info().clone(),
            current_authority: self.current_owner.to_account_info().clone(),
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
pub struct Extract {
    // TODO: support extract NFT from token back to another owner
}

#[account]
pub struct ChildrenMetadata {
    pub reversable: bool,
    pub child: Pubkey, // children is found via filtering their authority (1 to many)
    // [ “childrenOf“, pubkey, metaDataIndex ]
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
}
