use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("nftNZSYP2LiWYW4zDdcNwimx6jWjJ8FnfN71o1ukd4p");

#[program]
pub mod synft {
    use super::*;

    pub fn nft_copy(
        ctx: Context<NftCopy>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::nft_copy::handler(ctx, name, symbol, uri)
    }

    pub fn inject_to_root(
        ctx: Context<InjectToRoot>,
        is_mutable: bool,
        child_meta_bump: u8,
        parent_meta_bump: u8,
        parent_meta_of_child_bump: u8,
    ) -> Result<()> {
        instructions::inject_to_root::handler(
            ctx,
            is_mutable,
            child_meta_bump,
            parent_meta_bump,
            parent_meta_of_child_bump,
        )
    }

    pub fn inject_to_non_root(
        ctx: Context<InjectToNonRoot>,
        is_mutable: bool,
        child_bump: u8,
        parent_bump: u8,
    ) -> Result<()> {
        instructions::inject_to_non_root::handler(ctx, is_mutable, child_bump, parent_bump)
    }

    pub fn inject_to_sol(
        ctx: Context<InjectSol>,
        bump: u8,
        inject_sol_amount: u64,
    ) -> Result<()> {
        instructions::inject_sol::handler(ctx, bump, inject_sol_amount)
    }

    pub fn transfer_child_nft(ctx: Context<TransferChildNft>, _bump: u8) -> Result<()> {
        instructions::transfer_child_nft::handler(ctx, _bump)
    }

    pub fn extract_sol(ctx: Context<ExtractSol>, _bump: u8) -> Result<()> {
        instructions::extract_sol::handler(ctx, _bump)
    }

    pub fn transfer_crank_init(ctx: Context<TransferCrankInit>) -> Result<()> {
        instructions::transfer_crank_init::handler(ctx)
    }

    pub fn transfer_crank_process(ctx: Context<TransferCrankProcess>) -> Result<()> {
        instructions::transfer_crank_process::handler(ctx)
    }

    pub fn transfer_crank_end(ctx: Context<TransferCrankEnd>) -> Result<()> {
        instructions::transfer_crank_end::handler(ctx)
    }

    pub fn start_burn(ctx: Context<StartBurn>) -> Result<()> {
        instructions::burn::handle_start_burn(ctx)
    }

    pub fn start_branch(ctx: Context<StartBranch>) -> Result<()> {
        instructions::burn::handle_start_branch(ctx)
    }

    pub fn update_branch(ctx: Context<UpdateBranch>) -> Result<()> {
        instructions::burn::handle_update_branch(ctx)
    }
    
    pub fn deal_single_new_root(ctx: Context<DealSingleNewRoot>) -> Result<()> {
        instructions::burn::handle_deal_single_new_root(ctx)
    }
}
