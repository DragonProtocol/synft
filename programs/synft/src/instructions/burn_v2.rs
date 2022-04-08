use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, SetAuthority, Mint, Token, TokenAccount, Burn,
};
use spl_token::instruction::AuthorityType;
use crate::state::metadata::{
    CRANK_PDA_SEED, CHILDREN_PDA_SEED, PARENT_PDA_SEED, SOL_PDA_SEED, NEW_ROOT_INFO_SEED, BRANCH_INFO_SEED, ROOT_OWNER_SEED, 
    ParentMetadata, SolAccount, CrankMetadata, ChildrenMetadataV2, NewRootInfo, BranchInfo, RootOwner,
    pubkey_array_append, pubkey_array_all_empty, pubkey_array_find, pubkey_array_len, pubkey_array_remove,
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
        constraint = parent_metadata.is_burnt == false,
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


// impl<'info> BurnV2<'info> {
//     fn into_burn_context(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
//         let cpi_accounts = Burn {
//             mint: self.parent_mint_account.to_account_info().clone(),
//             to: self.parent_token_account.to_account_info().clone(),
//             authority: self.current_owner.to_account_info().clone(),
//         };

//         CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
//     }
// }

// pub fn handler(ctx: Context<BurnV2>, _sol_account_bump: u8, _parent_metadata_bump: u8) -> Result<()> {
//     panic!("not supported");
//     ctx.accounts.parent_metadata.is_burnt = true;
//     token::burn(ctx.accounts.into_burn_context(), ctx.accounts.parent_token_account.amount)?;
//     ctx.accounts
//             .sol_account
//             .close(ctx.accounts.current_owner.to_account_info())?;
//     Ok(())
// }

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


// fn into_close_account_context<'info>(
//     token_program: AccountInfo<'info>, 
//     account: AccountInfo<'info>,
//     destination: AccountInfo<'info>,
//     authority: AccountInfo<'info>,
//     ) -> CpiContext<'info, 'info, 'info, 'info, CloseAccount<'info>> {
//     let cpi_accounts = CloseAccount { account: account, destination: destination, authority: authority };
//     CpiContext::new(token_program, cpi_accounts)
// }

#[derive(Accounts)]
pub struct StartBurn<'info> {
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
        constraint = parent_metadata.is_burnt == false,
        seeds = [PARENT_PDA_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub parent_metadata : Box<Account<'info, ParentMetadata>>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<SolAccount>() + 8,
        seeds = [SOL_PDA_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub sol_account : Box<Account<'info, SolAccount>>,
    #[account(
        init,
        payer = current_owner,
        space = size_of::<RootOwner>() + 8,
        seeds = [ROOT_OWNER_SEED, parent_mint_account.key().as_ref()], bump,
    )]
    pub old_root_owner: Box<Account<'info, RootOwner>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

pub fn handle_start_burn(ctx: Context<StartBurn>) -> Result<()> {
    let current_owner = &mut ctx.accounts.current_owner;
    let root_mint = &mut ctx.accounts.parent_mint_account;
    let root_token = &mut ctx.accounts.parent_token_account;
    let root_metadata = &mut ctx.accounts.parent_metadata;
    let sol_account = &mut ctx.accounts.sol_account;
    let token_program = &mut ctx.accounts.token_program;
    let old_root_owner = &mut ctx.accounts.old_root_owner;

    root_metadata.is_burnt = true;
    old_root_owner.owner = current_owner.key();

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
        old_root_owner.close(current_owner.to_account_info())?;
    }

    sol_account.close(current_owner.to_account_info())?;
    
    Ok(())
}

#[derive(Accounts)]
pub struct DealSingleNewRoot<'info> {
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

    #[account(mut,
        constraint = parent_metadata.is_burnt == true,
        constraint = parent_token.mint == parent_mint.key(),
        constraint = child_token.mint == child_mint.key(),
        seeds = [PARENT_PDA_SEED, parent_mint.key().as_ref()], bump,
    )]
    pub parent_metadata : Box<Account<'info, ParentMetadata>>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<ParentMetadata>() + 8,
        seeds = [PARENT_PDA_SEED, child_mint.key().as_ref()], bump,
    )]
    pub child_metadata : Box<Account<'info, ParentMetadata>>,

    #[account(mut,
        constraint = children_metadata.is_mutated == false,
        seeds = [CHILDREN_PDA_SEED, parent_mint.key().as_ref(), child_mint.key().as_ref()], bump,
    )]
    pub children_metadata : Box<Account<'info, ChildrenMetadataV2>>,

    #[account(mut,
        seeds = [ROOT_OWNER_SEED, parent_mint.key().as_ref()], bump,
    )]
    pub old_root_owner: Box<Account<'info, RootOwner>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

pub fn handle_deal_single_new_root(ctx: Context<DealSingleNewRoot>) -> Result<()> {
    let current_owner = &mut ctx.accounts.current_owner;
    let parent_token = &mut ctx.accounts.parent_token;
    let parent_mint = &mut ctx.accounts.parent_mint;
    let parent_metadata = &mut ctx.accounts.parent_metadata;
    let child_token = &mut ctx.accounts.child_token;
    let child_mint = &mut ctx.accounts.child_mint;
    let child_metadata = &mut ctx.accounts.child_metadata;
    let children_metadata = &mut ctx.accounts.children_metadata;
    let token_program = &mut ctx.accounts.token_program;
    let old_root_owner = &mut ctx.accounts.old_root_owner;

    if pubkey_array_len(&child_metadata.immediate_children) > 0 {
        panic!("handle_deal_single_new_root failed");
    }

    let new_root_finished = true;

    if new_root_finished {
        pubkey_array_remove(&mut parent_metadata.immediate_children, child_mint.key());
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
            Some(old_root_owner.owner),
        )?;
        children_metadata.close(current_owner.to_account_info())?;    
        child_metadata.height -= 1;

        let all_finished = pubkey_array_all_empty(& parent_metadata.immediate_children);
        if all_finished {
            let seeds = &[
                &PARENT_PDA_SEED[..],
                parent_mint.to_account_info().key.as_ref(),
                &[parent_metadata.bump],
            ];
            token::burn(
                into_burn_context(
                    token_program.to_account_info(), 
                    parent_mint.to_account_info(), 
                    parent_token.to_account_info(), 
                    parent_metadata.to_account_info()
                ).with_signer(&[&seeds[..]]), 
                parent_token.amount)?;
            parent_metadata.close(current_owner.to_account_info())?;    
            old_root_owner.close(current_owner.to_account_info())?;
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct StartBranch<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,

    #[account(mut)]
    pub parent_token: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub child_token: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub parent_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub child_mint: Box<Account<'info, Mint>>,

    #[account(mut,
        constraint = parent_metadata.is_burnt == true,
        constraint = parent_token.mint == parent_mint.key(),
        constraint = child_token.mint == child_mint.key(),
        seeds = [PARENT_PDA_SEED, parent_mint.key().as_ref()], bump,
    )]
    pub parent_metadata : Box<Account<'info, ParentMetadata>>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<ParentMetadata>() + 8,
        seeds = [PARENT_PDA_SEED, child_mint.key().as_ref()], bump,
    )]
    pub child_metadata : Box<Account<'info, ParentMetadata>>,

    #[account(mut,
        constraint = children_metadata.is_mutated == false,
        seeds = [CHILDREN_PDA_SEED, parent_mint.key().as_ref(), child_mint.key().as_ref()], bump,
    )]
    pub children_metadata : Box<Account<'info, ChildrenMetadataV2>>,
    
    #[account(mut)]
    pub grandson_mint: Box<Account<'info, Mint>>,
    #[account(
        init_if_needed,
        payer = current_owner,
        space = size_of::<ParentMetadata>() + 8,
        seeds = [PARENT_PDA_SEED, grandson_mint.key().as_ref()], bump,
    )]
    pub grandson_metadata : Box<Account<'info, ParentMetadata>>,
    #[account(mut,
        seeds = [CHILDREN_PDA_SEED, child_mint.key().as_ref(), grandson_mint.key().as_ref()], bump,
    )]
    pub grandson_children_metadata : Box<Account<'info, ChildrenMetadataV2>>,

    #[account(
        init,
        payer = current_owner,
        space = size_of::<CrankMetadata>() + 8,
        seeds = [CRANK_PDA_SEED, grandson_mint.key().as_ref()], bump,
    )]
    pub crank_metadata : Box<Account<'info, CrankMetadata>>,

    #[account(
        init_if_needed, 
        payer = current_owner,
        space = size_of::<NewRootInfo>() + 8,
        seeds = [NEW_ROOT_INFO_SEED, child_mint.key().as_ref()], bump,
    )]
    pub new_root_info: Box<Account<'info, NewRootInfo>>,
    
    #[account(
        init, 
        payer = current_owner,
        space = size_of::<BranchInfo>() + 8,
        seeds = [BRANCH_INFO_SEED, child_mint.key().as_ref(), grandson_mint.key().as_ref()], bump,
    )]
    pub branch_info: Box<Account<'info, BranchInfo>>,

    #[account(mut,
        seeds = [ROOT_OWNER_SEED, parent_mint.key().as_ref()], bump,
    )]
    pub old_root_owner: Box<Account<'info, RootOwner>>,

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
    let crank_metadata = &mut ctx.accounts.crank_metadata;
    let token_program = &mut ctx.accounts.token_program;

    let grandson_metadata = &mut ctx.accounts.grandson_metadata;
    let grandson_children_metadata = &mut ctx.accounts.grandson_children_metadata;
    let new_root_info = &mut ctx.accounts.new_root_info;
    let branch_info = &mut ctx.accounts.branch_info;
    let old_root_owner = &mut ctx.accounts.old_root_owner;

    grandson_children_metadata.root = grandson_children_metadata.key();
    new_root_info.root = grandson_children_metadata.key();
    grandson_metadata.height -= 1;

    if pubkey_array_len(&grandson_metadata.immediate_children) > 0 {
        pubkey_array_append(&grandson_metadata.immediate_children, &mut crank_metadata.not_processed_children);
    } else {
        branch_info.close(current_owner.to_account_info())?;
        crank_metadata.close(current_owner.to_account_info())?;
        new_root_info.branch_finished += 1;
    }

    let mut new_root_finished = false;
    if new_root_info.branch_finished == pubkey_array_len(&child_metadata.immediate_children) {
        new_root_finished = true;
    }

    if new_root_finished {
        new_root_info.close(current_owner.to_account_info())?;
        pubkey_array_remove(&mut parent_metadata.immediate_children, child_mint.key());
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
            Some(old_root_owner.owner),
        )?;

        children_metadata.close(current_owner.to_account_info())?;
        child_metadata.height -= 1;

        let all_finished = pubkey_array_all_empty(& parent_metadata.immediate_children);
        if all_finished {
            let seeds = &[
                &PARENT_PDA_SEED[..],
                parent_mint.to_account_info().key.as_ref(),
                &[parent_metadata.bump],
            ];
            token::burn(
                into_burn_context(
                    token_program.to_account_info(), 
                    parent_mint.to_account_info(), 
                    parent_token.to_account_info(), 
                    parent_metadata.to_account_info()
                ).with_signer(&[&seeds[..]]), 
                parent_token.amount)?;
            parent_metadata.close(current_owner.to_account_info())?;
            old_root_owner.close(current_owner.to_account_info())?;
        }
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
    #[account(mut,
        seeds = [PARENT_PDA_SEED, child_mint.key().as_ref()], bump,
    )]
    pub child_metadata : Box<Account<'info, ParentMetadata>>,
    #[account(mut,
        seeds = [CHILDREN_PDA_SEED, parent_mint.key().as_ref(), child_mint.key().as_ref()], bump,
    )]
    pub children_metadata : Box<Account<'info, ChildrenMetadataV2>>,

    #[account(mut)]
    pub old_root_mint: Account<'info, Mint>,
    #[account(mut)]
    pub old_root_token: Account<'info, TokenAccount>,
    #[account(mut,
        constraint = old_root_metadata.is_burnt == true,
        seeds = [PARENT_PDA_SEED, old_root_mint.key().as_ref()], bump,
    )]
    pub old_root_metadata : Box<Account<'info, ParentMetadata>>,

    #[account(mut)]
    pub new_root_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub new_root_token: Box<Account<'info, TokenAccount>>,
    #[account(mut,
        seeds = [PARENT_PDA_SEED, new_root_mint.key().as_ref()], bump,
    )]
    pub new_root_metadata : Box<Account<'info, ParentMetadata>>,

    #[account(mut,
        seeds = [CHILDREN_PDA_SEED, old_root_mint.key().as_ref(), new_root_mint.key().as_ref()], bump,
    )]
    pub root_children_metadata : Box<Account<'info, ChildrenMetadataV2>>,

    #[account(mut)]
    pub grandson_mint: Account<'info, Mint>,

    #[account(mut,
        seeds = [CRANK_PDA_SEED, grandson_mint.key().as_ref()], bump,
    )]
    pub crank_metadata : Box<Account<'info, CrankMetadata>>,

    #[account(mut,
        seeds = [NEW_ROOT_INFO_SEED, new_root_mint.key().as_ref()], bump,
    )]
    pub new_root_info: Box<Account<'info, NewRootInfo>>,

    #[account(mut,
        seeds = [BRANCH_INFO_SEED, new_root_mint.key().as_ref(), grandson_mint.key().as_ref()], bump,
    )]
    pub branch_info: Box<Account<'info, BranchInfo>>,

    #[account(mut,
        seeds = [ROOT_OWNER_SEED, old_root_mint.key().as_ref()], bump,
    )]
    pub old_root_owner: Box<Account<'info, RootOwner>>,

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
    let crank_metadata = &mut ctx.accounts.crank_metadata;
    let root_children_metadata = &mut ctx.accounts.root_children_metadata;
    
    let token_program = &mut ctx.accounts.token_program;

    let new_root_info = &mut ctx.accounts.new_root_info;
    let branch_info = &mut ctx.accounts.branch_info;
    let old_root_owner = &mut ctx.accounts.old_root_owner;

    let pos = pubkey_array_find(&crank_metadata.not_processed_children, child_mint.key());
    if pos == u32::MAX {
        panic!("handle_update_branch");
    }

    children_metadata.root = new_root_info.root;
    child_metadata.height -= 1;

    crank_metadata.not_processed_children[pos as usize] = Pubkey::default();
    pubkey_array_append(& child_metadata.immediate_children, &mut crank_metadata.not_processed_children);

    let branch_finished = pubkey_array_all_empty(& crank_metadata.not_processed_children);

    if branch_finished {
        new_root_info.branch_finished += 1;
        crank_metadata.close(current_owner.to_account_info())?;
        branch_info.close(current_owner.to_account_info())?;

        let mut new_root_finished = false;
        if new_root_info.branch_finished == pubkey_array_len(&new_root_metadata.immediate_children) {
            new_root_finished = true;
        }

        if new_root_finished {
            new_root_info.close(current_owner.to_account_info())?;
            pubkey_array_remove(&mut old_root_metadata.immediate_children, new_root_mint.key());
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
                Some(old_root_owner.owner),
            )?;
            root_children_metadata.close(current_owner.to_account_info())?;    
            new_root_metadata.height -= 1;

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
                old_root_owner.close(current_owner.to_account_info())?;
            }
        }
    }

    Ok(())
}


