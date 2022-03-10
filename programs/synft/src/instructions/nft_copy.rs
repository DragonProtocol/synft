use anchor_lang::prelude::*;

use crate::state::*;
use anchor_spl::token::{
    self, InitializeAccount, InitializeMint, Mint, MintTo, Token, TokenAccount
};
use mpl_token_metadata::instruction::create_metadata_accounts_v2;
use solana_program::program::invoke;

#[derive(Clone)]
pub struct TokenMetadata;

impl anchor_lang::Id for TokenMetadata {
    fn id() -> Pubkey {
        mpl_token_metadata::ID
    }
}


#[derive(Accounts)]
pub struct NftCopy<'info> {
    // Do this instruction when the parent do NOT has any metadata associated
    // with it. This is checked offchain before sending this tx.
    #[account(mut)]
    pub current_owner: Signer<'info>,
    pub from_nft_mint: Account<'info, Mint>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub nft_meta_data_account: AccountInfo<'info>,

    #[account(
        init,
        payer = current_owner,
        space = Mint::LEN,
        owner = token_program.key(),
        seeds = [SYNTHETIC_NFT_MINT_SEED, from_nft_mint.key().as_ref()], bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint_account: AccountInfo<'info>,

    #[account(
        init,
        payer = current_owner,
        seeds = [SYNTHETIC_NFT_ACOUNT_SEED, from_nft_mint.key().as_ref()], bump,
        owner = token_program.key(),
        space = TokenAccount::LEN
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_token_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub mpl_program: Program<'info, TokenMetadata>,
}
impl<'info> NftCopy<'info> {
    fn initialize_mint_context(&self) -> CpiContext<'_, '_, '_, 'info, InitializeMint<'info>> {
        let cpi_accounts = InitializeMint {
            mint: self.nft_mint_account.clone(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
    fn initialize_mint_to_context(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.nft_mint_account.clone(),
            to: self.nft_token_account.to_account_info(),
            authority: self.current_owner.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
    fn initialize_account_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, InitializeAccount<'info>> {
        let cpi_accounts = InitializeAccount {
            account: self.nft_token_account.to_account_info(),
            mint: self.nft_mint_account.to_account_info(),
            authority: self.current_owner.to_account_info(),
            rent: self.rent.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(
    ctx: Context<NftCopy>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    // create mint account
    token::initialize_mint(
        ctx.accounts.initialize_mint_context(),
        0,
        &ctx.accounts.current_owner.key,
        None,
    )?;
    msg!("create mint account");

    // create spl token account
    token::initialize_account(ctx.accounts.initialize_account_context())?;
    msg!("create spl token account");

    // mint 1 nft 
    token::mint_to(ctx.accounts.initialize_mint_to_context(), 1)?;

    // create metadata
    invoke(
        &create_metadata_accounts_v2(
            mpl_token_metadata::ID,
            ctx.accounts.nft_meta_data_account.key(),
            ctx.accounts.nft_mint_account.to_account_info().key(),
            ctx.accounts.current_owner.to_account_info().key(),
            ctx.accounts.current_owner.to_account_info().key(),
            ctx.accounts.current_owner.to_account_info().key(),
            name,
            symbol,
            uri,
            None,
            0,
            true,
            true,
            None,
            None,
        ),
        &[
            ctx.accounts.nft_meta_data_account.clone(),
            ctx.accounts.nft_mint_account.to_account_info(),
            ctx.accounts.current_owner.to_account_info(),
            ctx.accounts.current_owner.to_account_info(),
            ctx.accounts.current_owner.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
    )?;

    Ok(())
}