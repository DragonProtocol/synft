use anchor_lang::prelude::*;

#[error_code]
pub enum Error {
    #[msg("Not enough nft count to burn")]
    NotEnoughNFTCount,
    #[msg("nft metadata collection is none")]
    MetadataCollectionIsNone,
    #[msg("collection mint not equal")]
    CollectionMintNotEqual,
}
