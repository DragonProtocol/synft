use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("nftbxaFtUMxSip8eMTKCPbX9HvjKQmcREG6NyQ23auD");

#[program]
pub mod synft {
    use super::*;

    pub fn initialize_inject(
        ctx: Context<InitializeInject>,
        reversible: bool,
        bump: u8,
    ) -> Result<()> {
        instructions::initialize_inject::handler(ctx, reversible, bump)
    }

    pub fn initialize_fungible_token_inject(
        ctx: Context<InitializeFungibleTokenInject>,
        reversible: bool,
        bump: u8,
        inject_fungible_token_amount: u64,
    ) -> Result<()> {
        instructions::initialize_fungible_token_inject::handler(
            ctx,
            reversible,
            bump,
            inject_fungible_token_amount,
        )
    }

    pub fn initialize_sol_inject(
        ctx: Context<InitializeSolInject>,
        reversible: bool,
        bump: u8,
        inject_sol_amount: u64,
    ) -> Result<()> {
        instructions::initialize_sol_inject::handler(ctx, reversible, bump, inject_sol_amount)
    }

    pub fn extract(ctx: Context<Extract>, _bump: u8) -> Result<()> {
        instructions::extract::handler(ctx, _bump)
    }

    pub fn extract_sol(ctx: Context<ExtractSol>, _bump: u8) -> Result<()> {
        instructions::extract_sol::handler(ctx, _bump)
    }

    pub fn nft_copy(
        ctx: Context<NftCopy>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::nft_copy::handler(ctx, name, symbol, uri)
    }
    pub fn burn_for_sol(ctx: Context<BurnForSol>) -> Result<()> {
        instructions::burn_for_sol::handler(ctx)
    }

    pub fn burn_for_token(ctx: Context<BurnForToken>) -> Result<()> {
        instructions::burn_for_token::handler(ctx)
    }

    pub fn inject_to_root_v2(
        ctx: Context<InjectToRootV2>,
        is_mutable: bool,
        bump: u8,
    ) -> Result<()> {
        instructions::inject_to_root_v2::handler(ctx, is_mutable, bump)
    }

    pub fn inject_to_non_root_v2(
        ctx: Context<InjectToNonRootV2>,
        is_mutable: bool,
        bump: u8,
    ) -> Result<()> {
        instructions::inject_to_non_root_v2::handler(ctx, is_mutable, bump)
    }

    pub fn inject_to_sol_v2(
        ctx: Context<InjectSolV2>,
        bump: u8,
        inject_sol_amount: u64,
    ) -> Result<()> {
        instructions::inject_sol_v2::handler(ctx, bump, inject_sol_amount)
    }

    pub fn transfer_child_nft_v2(ctx: Context<TransferChildNftV2>, _bump: u8) -> Result<()> {
        instructions::transfer_child_nft_v2::handler(ctx, _bump)
    }

    pub fn extract_sol_v2(ctx: Context<ExtractSolV2>, _bump: u8) -> Result<()> {
        instructions::extract_sol_v2::handler(ctx, _bump)
    }

    pub fn extract_v2(ctx: Context<ExtractV2>, _bump: u8) -> Result<()> {
        instructions::extract_v2::handler(ctx, _bump)
    }

    pub fn burn_for_sol_v2(ctx: Context<BurnV2>, _bump: u8) -> Result<()> {
        instructions::burn_v2::handler(ctx, _bump)
    }
}