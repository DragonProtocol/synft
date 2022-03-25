## Architecture
![arch](./architecture.jpg)
### PDAs
```
#[account]
pub struct ChildrenMetadataV2 { // binding parent-child relationships
    // parent, mint refer to "mint", root refers to pda
    pub child: Pubkey,
    pub parent: Pubkey,
    pub root: Pubkey,
    pub is_mutable: bool,
    pub is_burnt: bool,
    pub is_mutated: bool,
    pub child_type: ChildType,
    pub bump: u8,
}
#[account]
pub struct ParentMetadata { // pointer to nft's own
    pub bump: u8,
    pub is_burnt: bool,
    pub height: u8,
    pub immediate_children: [Pubkey; 3], // pointer to immediate children
}
#[account]
pub struct SolAccount {   // store sol for associating nft
    pub bump: u8,
}
```
Based on the current model relationship, you can build multiple levels of NFT structure. When performing some operations(tranfer out/burn,etc), the protocol needs to update the relationship between parent and child NFT nodes. However, due to Solana's programming model, the protocol needs to update the data state of PDA asynchronously off-chain, which is called "crank" operation. According to crank PDA, the agreement will update the data in the way of breadth first search, and finally correct all the data.
```
#[account]
pub struct CrankMetadata {
    pub tranfered_nft: Pubkey, // nft mint account
    pub old_root_meta_data: Pubkey, // old root meta data
    pub new_root_meta_data: Pubkey, 
    pub not_processed_children: [Pubkey; 32], // children nodes that have not been processed
}
```

## API list
* inject to root nft
* inject to non-root nft
* inject sol
* transfer/extract child nft 
* burn root nft for sol
* burn root nft only
* copy nft

