use anchor_lang::prelude::*;

pub const CHILDREN_PDA_SEED: &[u8] = b"children-of";
pub const PARENT_PDA_SEED: &[u8] = b"parent-metadata-seed";
pub const SPL_TOKEN_PDA_SEED: &[u8] = b"fungible-token-seed";
pub const SYNTHETIC_NFT_MINT_SEED: &[u8] = b"synthetic-nft-mint-seed";
pub const SYNTHETIC_NFT_ACOUNT_SEED: &[u8] = b"synthetic-nft-account-seed";
pub const SOL_PDA_SEED: &[u8] = b"sol-seed";

#[account]
pub struct ChildrenMetadata {
    pub reversible: bool,
    pub child: Pubkey,
    // children is found via filtering their authority (1 to many)
    // [ "childrenOf", pubkey, metaDataIndex ]
    pub child_type: ChildType,
    pub bump: u8,
}

#[account]
pub struct ChildrenMetadataV2 {
    // parent, root, mint refer to "mint"
    pub child: Pubkey,
    pub parent: Pubkey,
    pub root: Pubkey,
    pub is_mutable: bool,
    pub is_mutated: bool,
    pub is_burnt: bool,
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
#[derive(Default)]
pub struct CrunkMetadata {
    pub tranfered_nft: Pubkey, // nft mint account
    pub old_root_meta_data: Pubkey, // old root meta data
    pub new_root_meta_data: Pubkey, 
    pub new_owner: Pubkey,
    pub not_processed_children: [Pubkey; 32], // children nodes that have not been processed
}

// use cases: 
// 1. build the whole nft tree
// 2. crunk processing depends on this structure 
#[account]
pub struct ParentMetadata {
    pub owner: Pubkey,  // pointer to the owner
    pub nft: Pubkey,  // pointer to self mint
    // pub immediate_children: [Pubkey; 32], //pointer to immediate children
}

#[account]
pub struct SolAccount {
    pub bump: u8,
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
}
