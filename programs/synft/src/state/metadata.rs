use anchor_lang::prelude::*;

pub const CHILDREN_PDA_SEED: &[u8] = b"children-of";
pub const PARENT_PDA_SEED: &[u8] = b"parent-metadata-seed";
pub const SPL_TOKEN_PDA_SEED: &[u8] = b"fungible-token-seed";
pub const SYNTHETIC_NFT_MINT_SEED: &[u8] = b"synthetic-nft-mint-seed";
pub const SYNTHETIC_NFT_ACOUNT_SEED: &[u8] = b"synthetic-nft-account-seed";
pub const SOL_PDA_SEED: &[u8] = b"sol-seed";
pub const CRANK_PDA_SEED: &[u8] = b"crank-seed";
pub const TREE_LEVEL_HEIGHT_LIMIT: u8 = 3;

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
