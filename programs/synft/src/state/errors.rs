use anchor_lang::prelude::*;

#[error_code]
pub enum SynftError {
    #[msg("Not enough nft count to burn")]
    NotEnoughNFTCount,
    #[msg("nft metadata collection is none")]
    MetadataCollectionIsNone,
    #[msg("collection mint not equal")]
    CollectionMintNotEqual,
    #[msg("collection not verified")]
    CollectionNotVerified,
    #[msg("collection lamports not enough")]
    LamportsNotEnough,
    #[msg("metadata nft not match")]
    NftMetadataNotMatch,
    #[msg("NumericalOverflowError")]
    NumericalOverflowError,
    #[msg("MissingRequiredSignature")]
    MissingRequiredSignature
}
