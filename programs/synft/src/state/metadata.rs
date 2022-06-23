use anchor_lang::prelude::*;

pub const CHILDREN_PDA_SEED: &[u8] = b"children-of";
pub const PARENT_PDA_SEED: &[u8] = b"parent-metadata-seed";
pub const SPL_TOKEN_PDA_SEED: &[u8] = b"fungible-token-seed";
pub const SYNTHETIC_NFT_MINT_SEED: &[u8] = b"synthetic-nft-mint-seed";
pub const SYNTHETIC_NFT_ACOUNT_SEED: &[u8] = b"synthetic-nft-account-seed";
pub const SOL_PDA_SEED: &[u8] = b"sol-seed";
pub const CRANK_PDA_SEED: &[u8] = b"crank-seed";

pub const ROOT_OWNER_SEED: &[u8] = b"root-owner-seed";
pub const NEW_ROOT_INFO_SEED: &[u8] = b"new-root-info-seed";
pub const BRANCH_INFO_SEED: &[u8] = b"branch-info-seed";

pub const TREE_LEVEL_HEIGHT_LIMIT: u8 = 3;


#[account]
pub struct ChildrenMetadataV2 {
    // parent, child refer to "mint"
    pub child: Pubkey,
    pub parent: Pubkey,
    pub root: Pubkey,
    pub is_mutable: bool,
    pub is_burnt: bool,
    pub is_mutated: bool,
    pub child_type: ChildType,
    pub bump: u8,
}

#[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy, PartialEq)]
pub enum ChildType {
    SOL,
    SPL,
    NFT,
}

#[account]
pub struct CrankMetadata {
    pub tranfered_nft: Pubkey, // nft mint account
    pub old_children_root_meta_data: Pubkey, // old root meta data
    pub closed_children_meta_data: Pubkey,  // need to close
    pub not_processed_children: [Pubkey; 8], // children nodes that have not been processed
}

impl CrankMetadata{
    pub fn has_children(&self) -> bool {
        for child in self.not_processed_children.iter() {
            if !child.eq(&Pubkey::default()) {
                return true;
            }
        }
        return false;
    }
}

#[account]
pub struct ParentMetadata {
    pub bump: u8,
    pub is_burnt: bool,
    pub height: u8,
    pub self_mint: Pubkey, //pointer to self
    pub immediate_children: [Pubkey; 3], //pointer to immediate children
}

impl ParentMetadata{
    pub fn has_children(&self) -> bool {
        for immediate_child in self.immediate_children.iter() {
            if !immediate_child.eq(&Pubkey::default()) {
                return true;
            }
        }
        return false;
    }
}

#[account]
pub struct SolAccount {
    pub bump: u8,
    pub reserve_buffer: [Pubkey; 12],
}

#[account]
pub struct NewRootInfo {
    pub branch_finished: u32,
    pub root: Pubkey,
}

#[account]
pub struct BranchInfo {
}

#[account]
pub struct RootOwner {
    pub owner: Pubkey
}

#[error_code]
pub enum ErrorCode {
    #[msg("The bump passed in does not match the bump in the PDA")]
    InvalidMetadataBump,
    #[msg("Current owner is not the authority of the parent token")]
    InvalidAuthority,
    #[msg("Only Reversible Synthetic Tokens can be extracted")]
    InvalidExtractAttempt,
    #[msg("Wrong type of burn instruction for the token")]
    InvalidBurnType,
    #[msg("Wrong opration of crank process instruction for the token")]
    InvalidTransferCrankProcess,
    #[msg("Wrong opration of crank end instruction for the token")]
    InvalidTransferCrankEnd
}

// ------------------------------------------------------------------------------------------------------------------

pub fn pubkey_array_append(src: &[Pubkey], dst: &mut [Pubkey]) {
    for i in 0..src.len() {
        if !src[i].eq(&Pubkey::default()) {
            for j in 0..dst.len() {
                if dst[j].eq(&Pubkey::default()) {
                    dst[j] = src[i];
                    break;
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

pub fn pubkey_array_find(arr: &[Pubkey], key: Pubkey) -> u32 {

    for i in 0..arr.len() {
        if arr[i].eq(&key) {
            return i as u32;
        }
    }
    u32::MAX
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

pub fn pubkey_array_print(arr: &[Pubkey]) {
    msg!("------------>>>>");
    for i in 0..arr.len() {
        msg!("{:x?}", arr[i].to_bytes());
    }
    msg!("------------<<<<");
}

// ------------------------------------------------------------------------------------------------------------------
