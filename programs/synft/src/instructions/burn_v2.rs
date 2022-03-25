use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, SetAuthority, Mint, Token, TokenAccount, Burn
};
use spl_token::instruction::AuthorityType;
use crate::state::metadata::{
    CHILDREN_PDA_SEED, PARENT_PDA_SEED, SOL_PDA_SEED, ParentMetadata, SolAccount, CrunkMetadata, ChildrenMetadataV2
};
use anchor_lang::AccountsClose;
use std::mem::size_of;

#[derive(Accounts)]
#[instruction( _sol_account_bump: u8, _parent_metadata_bump: u8)]
pub struct BurnV2<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_mint_account: Account<'info, Mint>,
    #[account(mut)]
    pub parent_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<ParentMetadata>() + 8,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        seeds = [PARENT_PDA_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub parent_metadata : Account<'info, ParentMetadata>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<SolAccount>() + 8,
        constraint = parent_token_account.owner == *current_owner.to_account_info().key,
        constraint = parent_token_account.mint == parent_mint_account.key(),
        constraint = sol_account.bump == _sol_account_bump,
        seeds = [SOL_PDA_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub sol_account : Account<'info, SolAccount>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}


impl<'info> BurnV2<'info> {
    fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.parent_mint_account.to_account_info().clone(),
            to: self.parent_token_account.to_account_info().clone(),
            authority: self.current_owner.to_account_info().clone(),
        };

        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

pub fn handler(ctx: Context<BurnV2>, _sol_account_bump: u8, _parent_metadata_bump: u8) -> Result<()> {
    ctx.accounts.parent_metadata.is_burnt = true;
    token::burn(ctx.accounts.into_burn_context(), ctx.accounts.parent_token_account.amount)?;
    ctx.accounts
            .sol_account
            .close(ctx.accounts.current_owner.to_account_info())?;
    Ok(())
}


//const ZEROPUBKEY: Pubkey = Pubkey::new_from_array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);

pub const CRUNK_PDA_SEED: &[u8] = b"crunk-metadata-seed";

// ------------------------------------------------------------------------------------------------------------------

fn into_set_authority_context<'info>(
    token_program: AccountInfo<'info>, 
    account_or_mint: AccountInfo<'info>, 
    current_authority: AccountInfo<'info>
    ) -> CpiContext<'info, 'info, 'info, 'info, SetAuthority<'info>> {
    let cpi_accounts = SetAuthority { account_or_mint: account_or_mint, current_authority: current_authority };
    CpiContext::new(token_program, cpi_accounts)
}

fn into_burn_context<'info>(
    token_program: AccountInfo<'info>, 
    mint: AccountInfo<'info>, 
    to: AccountInfo<'info>, 
    authority: AccountInfo<'info>
    ) -> CpiContext<'info, 'info, 'info, 'info, Burn<'info>> {
    let cpi_accounts = Burn { mint: mint, to: to, authority: authority };
    CpiContext::new(token_program, cpi_accounts)
}

pub fn pubkey_array_append(src: &[Pubkey], dst: &mut [Pubkey]) {
    for i in 0..src.len() {
        if !src[i].eq(&Pubkey::default()) {
            for j in 0..dst.len() {
                if dst[j].eq(&Pubkey::default()) {
                    dst[j] = src[i];
                }
            }
        }
    }
}

pub fn pubkey_array_all_empty(arr: &[Pubkey]) -> bool {
    for i in 0..arr.len() {
        if !arr[i].eq(&Pubkey::default()) {
            return false;
        }
    }
    true
}

pub fn pubkey_array_remove(arr: &mut[Pubkey], key: Pubkey) {
    for i in 0..arr.len() {
        if arr[i].eq(&key) {
            arr[i] = Pubkey::default();
        }
    }
}

pub fn pubkey_array_len(arr: &[Pubkey]) -> u32 {
    let mut cnt: u32 = 0;
    for i in 0..arr.len() {
        if !arr[i].eq(&Pubkey::default()) {
            cnt += 1;
        }
    }
    cnt
}

// ------------------------------------------------------------------------------------------------------------------

#[derive(Accounts)]
pub struct StartBurn<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub root_mint: Account<'info, Mint>,
    #[account(mut)]
    pub root_token: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<ParentMetadata>() + 8,
        constraint = root_token.owner == *current_owner.to_account_info().key,
        constraint = root_token.mint == root_mint.key(),
        seeds = [PARENT_PDA_SEED, root_mint.key().as_ref()], bump,
    )]
    pub root_metadata : Account<'info, ParentMetadata>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<SolAccount>() + 8,
        seeds = [SOL_PDA_SEED, root_mint.key().as_ref()], bump,
    )]
    pub sol_account : Account<'info, SolAccount>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

pub fn handle_start_burn(ctx: Context<StartBurn>) -> Result<()> {
    let current_owner = &mut ctx.accounts.current_owner;
    let root_mint = &mut ctx.accounts.root_mint;
    let root_token = &mut ctx.accounts.root_token;
    let root_metadata = &mut ctx.accounts.root_metadata;
    let sol_account = &mut ctx.accounts.sol_account;
    let token_program = &mut ctx.accounts.token_program;

    if root_metadata.is_burnt {
        panic!("handle_burn");        
    }
    root_metadata.is_burnt = true;

    sol_account.close(current_owner.to_account_info())?;

    if pubkey_array_len(&root_metadata.immediate_children) > 0 {
        token::set_authority(
            into_set_authority_context(
                token_program.to_account_info(), 
                root_token.to_account_info(), 
                current_owner.to_account_info()
            ),
            AuthorityType::AccountOwner,
            Some(root_metadata.key()),
        )?;
    } else {
        token::burn(
            into_burn_context(
                token_program.to_account_info(), 
                root_mint.to_account_info(), 
                root_token.to_account_info(), 
                current_owner.to_account_info()
            ), 
            root_token.amount)?;
        root_metadata.close(current_owner.to_account_info())?;    
    }
    Ok(())
}

#[derive(Accounts)]
pub struct StartBranch<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,

    #[account(mut)]
    pub parent_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub child_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub parent_mint: Account<'info, Mint>,
    #[account(mut)]
    pub child_mint: Account<'info, Mint>,

    #[account(
        constraint = parent_metadata.is_burnt == true,
        constraint = parent_token.mint == parent_mint.key(),
        constraint = child_token.mint == child_mint.key(),
        seeds = [PARENT_PDA_SEED, parent_mint.key().as_ref()], bump,
    )]
    pub parent_metadata : Account<'info, ParentMetadata>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<ParentMetadata>() + 8,
        seeds = [PARENT_PDA_SEED, child_mint.key().as_ref()], bump,
    )]
    pub child_metadata : Account<'info, ParentMetadata>,

    #[account(
        constraint = children_metadata.is_mutated == false,
        seeds = [CHILDREN_PDA_SEED, parent_mint.key().as_ref(), child_mint.key().as_ref()], bump,
    )]
    pub children_metadata : Account<'info, ChildrenMetadataV2>,
    
    #[account(
        init,
        payer = current_owner,
        space = size_of::<CrunkMetadata>() + 8,
        seeds = [CRUNK_PDA_SEED, child_mint.key().as_ref()], bump,
    )]
    pub crunk_metadata : Account<'info, CrunkMetadata>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}


pub fn handle_start_branch(ctx: Context<StartBranch>) -> Result<()> {
    let current_owner = &mut ctx.accounts.current_owner;
    let parent_token = &mut ctx.accounts.parent_token;
    let parent_mint = &mut ctx.accounts.parent_mint;
    let parent_metadata = &mut ctx.accounts.parent_metadata;
    let child_token = &mut ctx.accounts.child_token;
    let child_mint = &mut ctx.accounts.child_mint;
    let child_metadata = &mut ctx.accounts.child_metadata;
    let children_metadata = &mut ctx.accounts.children_metadata;
    let crunk_metadata = &mut ctx.accounts.crunk_metadata;
    let token_program = &mut ctx.accounts.token_program;

    if children_metadata.is_mutated {
        panic!("handle_start_branch");        
    }

    if pubkey_array_len(&child_metadata.immediate_children) > 0 {
        children_metadata.is_mutated = true;

        crunk_metadata.tranfered_nft = child_mint.key();
        crunk_metadata.old_root_meta_data = parent_mint.key();
        crunk_metadata.new_root_meta_data = child_mint.key();
    
        pubkey_array_append(&child_metadata.immediate_children, &mut crunk_metadata.not_processed_children);
    } else {
        pubkey_array_remove(&mut parent_metadata.immediate_children, child_mint.key());
        children_metadata.is_mutated = false;
        let seeds = &[
            &CHILDREN_PDA_SEED[..],
            parent_mint.to_account_info().key.as_ref(),
            child_mint.to_account_info().key.as_ref(),
            &[children_metadata.bump],
        ];
        token::set_authority(
            into_set_authority_context(
                token_program.to_account_info(), 
                child_token.to_account_info(), 
                children_metadata.to_account_info()
            ).with_signer(&[&seeds[..]]),
            AuthorityType::AccountOwner,
            Some(parent_token.owner),
        )?;
        children_metadata.close(current_owner.to_account_info())?;    
        child_metadata.close(current_owner.to_account_info())?;
        crunk_metadata.close(current_owner.to_account_info())?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateBranch<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,
    #[account(mut)]
    pub parent_mint: Account<'info, Mint>,
    #[account(mut)]
    pub child_mint: Account<'info, Mint>,
    #[account(
        seeds = [PARENT_PDA_SEED, child_mint.key().as_ref()], bump,
    )]
    pub child_metadata : Account<'info, ParentMetadata>,
    #[account(
        seeds = [CHILDREN_PDA_SEED, parent_mint.key().as_ref(), child_mint.key().as_ref()], bump,
    )]
    pub children_metadata : Account<'info, ChildrenMetadataV2>,

    #[account(mut)]
    pub old_root_mint: Account<'info, Mint>,
    #[account(mut)]
    pub old_root_token: Account<'info, TokenAccount>,
    #[account(
        constraint = old_root_metadata.is_burnt == true,
        seeds = [PARENT_PDA_SEED, old_root_mint.key().as_ref()], bump,
    )]
    pub old_root_metadata : Account<'info, ParentMetadata>,

    #[account(mut)]
    pub new_root_mint: Account<'info, Mint>,
    #[account(mut)]
    pub new_root_token: Account<'info, TokenAccount>,
    #[account(
        seeds = [PARENT_PDA_SEED, new_root_mint.key().as_ref()], bump,
    )]
    pub new_root_metadata : Account<'info, ParentMetadata>,

    #[account(
        constraint = root_children_metadata.is_mutated == true,
        seeds = [CHILDREN_PDA_SEED, old_root_mint.key().as_ref(), new_root_mint.key().as_ref()], bump,
    )]
    pub root_children_metadata : Account<'info, ChildrenMetadataV2>,

    #[account(
        seeds = [CRUNK_PDA_SEED, new_root_mint.key().as_ref()], bump,
    )]
    pub crunk_metadata : Account<'info, CrunkMetadata>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}


pub fn handle_update_branch(ctx: Context<UpdateBranch>) -> Result<()>{
    let current_owner = &mut ctx.accounts.current_owner;
    let child_mint = &mut ctx.accounts.child_mint;
    let child_metadata = &mut ctx.accounts.child_metadata;
    let children_metadata = &mut ctx.accounts.children_metadata;

    let old_root_mint = &mut ctx.accounts.old_root_mint;
    let old_root_token = &mut ctx.accounts.old_root_token;
    let old_root_metadata = &mut ctx.accounts.old_root_metadata;
    let new_root_mint = &mut ctx.accounts.new_root_mint;
    let new_root_token = &mut ctx.accounts.new_root_token;
    let new_root_metadata = &mut ctx.accounts.new_root_metadata;
    let crunk_metadata = &mut ctx.accounts.crunk_metadata;
    let root_children_metadata = &mut ctx.accounts.root_children_metadata;

    let token_program = &mut ctx.accounts.token_program;

    if !crunk_metadata.not_processed_children[0].eq(&child_mint.key()) {
        panic!("handle_update_branch");
    }
    children_metadata.root = new_root_metadata.key();
    crunk_metadata.not_processed_children[0] = Pubkey::default();
    pubkey_array_append(& child_metadata.immediate_children, &mut crunk_metadata.not_processed_children);

    let branch_finished = pubkey_array_all_empty(& crunk_metadata.not_processed_children);
    if branch_finished {
        pubkey_array_remove(&mut old_root_metadata.immediate_children, new_root_mint.key());
        root_children_metadata.is_mutated = false;

        let seeds = &[
            &CHILDREN_PDA_SEED[..],
            old_root_mint.to_account_info().key.as_ref(),
            new_root_mint.to_account_info().key.as_ref(),
            &[root_children_metadata.bump],
        ];
        token::set_authority(
            into_set_authority_context(
                token_program.to_account_info(), 
                new_root_token.to_account_info(), 
                root_children_metadata.to_account_info()
            ).with_signer(&[&seeds[..]]),
            AuthorityType::AccountOwner,
            Some(old_root_token.owner),
        )?;

        root_children_metadata.close(current_owner.to_account_info())?;    
        crunk_metadata.close(current_owner.to_account_info())?;

        let all_finished = pubkey_array_all_empty(& old_root_metadata.immediate_children);
        if all_finished {
            let seeds = &[
                &PARENT_PDA_SEED[..],
                old_root_mint.to_account_info().key.as_ref(),
                &[old_root_metadata.bump],
            ];
            token::burn(
                into_burn_context(
                    token_program.to_account_info(), 
                    old_root_mint.to_account_info(), 
                    old_root_token.to_account_info(), 
                    old_root_metadata.to_account_info()
                ).with_signer(&[&seeds[..]]), 
                old_root_token.amount)?;
            old_root_metadata.close(current_owner.to_account_info())?;    
        }
    }

    Ok(())
}

// impl<'info> UpdateBranch<'info> {
//     fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
//         let cpi_accounts = SetAuthority {
//             account_or_mint: self.new_root_token.to_account_info().clone(),
//             current_authority: self.root_children_metadata.to_account_info().clone(),
//         };
//         CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
//     }
//     fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
//         let cpi_accounts = Burn {
//             mint: self.old_root_mint.to_account_info().clone(),
//             to: self.old_root_token.to_account_info().clone(),
//             authority: self.old_root_metadata.to_account_info().clone(),
//         };
//         CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
//     }
// }

// impl<'info> StartBurn<'info> {
//     fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
//         let cpi_accounts = SetAuthority {
//             account_or_mint: self.root_token.to_account_info(),
//             current_authority: self.current_owner.to_account_info(),
//         };
//         CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
//     }
// }

