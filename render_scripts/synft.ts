export type Synft = {
  "version": "0.1.0",
  "name": "synft",
  "instructions": [
    {
      "name": "initializeInject",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reversible",
          "type": "bool"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeFungibleTokenInject",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fungibleTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reversible",
          "type": "bool"
        },
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "injectFungibleTokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeSolInject",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reversible",
          "type": "bool"
        },
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "injectSolAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "extract",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "extractSol",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "nftCopy",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fromNftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMetaDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "burnForSol",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnForToken",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "injectToRootV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfChild",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isMutable",
          "type": "bool"
        },
        {
          "name": "childMetaBump",
          "type": "u8"
        },
        {
          "name": "parentMataBump",
          "type": "u8"
        },
        {
          "name": "parentMataOfChildBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "injectToNonRootV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfParent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootMeta",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfChild",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isMutable",
          "type": "bool"
        },
        {
          "name": "childBump",
          "type": "u8"
        },
        {
          "name": "parentBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "injectToSolV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "injectSolAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferChildNftV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rootMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiverAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "extractSolV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "burnV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "solAccountBump",
          "type": "u8"
        },
        {
          "name": "parentMetadataBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "transferCrankInitV2",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfRoot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferCrankProcessV2",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferCrankEndV2",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childrenMetaOfRoot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfClose",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startBurn",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startBranch",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonChildrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "branchInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateBranch",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rootChildrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "branchInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "dealSingleNewRoot",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "newRootInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "branchFinished",
            "type": "u32"
          },
          {
            "name": "root",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "branchInfo",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "rootOwner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "childrenMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reversible",
            "type": "bool"
          },
          {
            "name": "child",
            "type": "publicKey"
          },
          {
            "name": "childType",
            "type": {
              "defined": "ChildType"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "childrenMetadataV2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "child",
            "type": "publicKey"
          },
          {
            "name": "parent",
            "type": "publicKey"
          },
          {
            "name": "root",
            "type": "publicKey"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "isBurnt",
            "type": "bool"
          },
          {
            "name": "isMutated",
            "type": "bool"
          },
          {
            "name": "childType",
            "type": {
              "defined": "ChildType"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "crankMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tranferedNft",
            "type": "publicKey"
          },
          {
            "name": "oldChildrenRootMetaData",
            "type": "publicKey"
          },
          {
            "name": "closedChildrenMetaData",
            "type": "publicKey"
          },
          {
            "name": "notProcessedChildren",
            "type": {
              "array": [
                "publicKey",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "parentMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isBurnt",
            "type": "bool"
          },
          {
            "name": "height",
            "type": "u8"
          },
          {
            "name": "selfMint",
            "type": "publicKey"
          },
          {
            "name": "immediateChildren",
            "type": {
              "array": [
                "publicKey",
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "solAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ChildType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "SOL"
          },
          {
            "name": "SPL"
          },
          {
            "name": "NFT"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidMetadataBump",
      "msg": "The bump passed in does not match the bump in the PDA"
    },
    {
      "code": 6001,
      "name": "InvalidAuthority",
      "msg": "Current owner is not the authority of the parent token"
    },
    {
      "code": 6002,
      "name": "InvalidExtractAttempt",
      "msg": "Only Reversible Synthetic Tokens can be extracted"
    },
    {
      "code": 6003,
      "name": "InvalidBurnType",
      "msg": "Wrong type of burn instruction for the token"
    },
    {
      "code": 6004,
      "name": "InvalidTransferCrankProcess",
      "msg": "Wrong opration of crank process instruction for the token"
    },
    {
      "code": 6005,
      "name": "InvalidTransferCrankEnd",
      "msg": "Wrong opration of crank end instruction for the token"
    }
  ]
};

export const IDL: Synft = {
  "version": "0.1.0",
  "name": "synft",
  "instructions": [
    {
      "name": "initializeInject",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reversible",
          "type": "bool"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeFungibleTokenInject",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ownerTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "fungibleTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reversible",
          "type": "bool"
        },
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "injectFungibleTokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeSolInject",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "reversible",
          "type": "bool"
        },
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "injectSolAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "extract",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "extractSol",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "nftCopy",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fromNftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMetaDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mplProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "burnForSol",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "burnForToken",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "injectToRootV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfChild",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isMutable",
          "type": "bool"
        },
        {
          "name": "childMetaBump",
          "type": "u8"
        },
        {
          "name": "parentMataBump",
          "type": "u8"
        },
        {
          "name": "parentMataOfChildBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "injectToNonRootV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfParent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootMeta",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfChild",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isMutable",
          "type": "bool"
        },
        {
          "name": "childBump",
          "type": "u8"
        },
        {
          "name": "parentBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "injectToSolV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "injectSolAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transferChildNftV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rootMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rootMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiverAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "extractSolV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "burnV2",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "solAccountBump",
          "type": "u8"
        },
        {
          "name": "parentMetadataBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "transferCrankInitV2",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfRoot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferCrankProcessV2",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childMintAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "childrenMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetaOfParent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "transferCrankEndV2",
      "accounts": [
        {
          "name": "operator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "childrenMetaOfRoot",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetaOfClose",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMeta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startBurn",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "startBranch",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonChildrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "branchInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateBranch",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rootChildrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "grandsonMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "crankMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "newRootInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "branchInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "dealSingleNewRoot",
      "accounts": [
        {
          "name": "currentOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "parentToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childrenMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oldRootOwner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "newRootInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "branchFinished",
            "type": "u32"
          },
          {
            "name": "root",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "branchInfo",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "rootOwner",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "childrenMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "reversible",
            "type": "bool"
          },
          {
            "name": "child",
            "type": "publicKey"
          },
          {
            "name": "childType",
            "type": {
              "defined": "ChildType"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "childrenMetadataV2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "child",
            "type": "publicKey"
          },
          {
            "name": "parent",
            "type": "publicKey"
          },
          {
            "name": "root",
            "type": "publicKey"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "isBurnt",
            "type": "bool"
          },
          {
            "name": "isMutated",
            "type": "bool"
          },
          {
            "name": "childType",
            "type": {
              "defined": "ChildType"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "crankMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tranferedNft",
            "type": "publicKey"
          },
          {
            "name": "oldChildrenRootMetaData",
            "type": "publicKey"
          },
          {
            "name": "closedChildrenMetaData",
            "type": "publicKey"
          },
          {
            "name": "notProcessedChildren",
            "type": {
              "array": [
                "publicKey",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "parentMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "isBurnt",
            "type": "bool"
          },
          {
            "name": "height",
            "type": "u8"
          },
          {
            "name": "selfMint",
            "type": "publicKey"
          },
          {
            "name": "immediateChildren",
            "type": {
              "array": [
                "publicKey",
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "solAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ChildType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "SOL"
          },
          {
            "name": "SPL"
          },
          {
            "name": "NFT"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidMetadataBump",
      "msg": "The bump passed in does not match the bump in the PDA"
    },
    {
      "code": 6001,
      "name": "InvalidAuthority",
      "msg": "Current owner is not the authority of the parent token"
    },
    {
      "code": 6002,
      "name": "InvalidExtractAttempt",
      "msg": "Only Reversible Synthetic Tokens can be extracted"
    },
    {
      "code": 6003,
      "name": "InvalidBurnType",
      "msg": "Wrong type of burn instruction for the token"
    },
    {
      "code": 6004,
      "name": "InvalidTransferCrankProcess",
      "msg": "Wrong opration of crank process instruction for the token"
    },
    {
      "code": 6005,
      "name": "InvalidTransferCrankEnd",
      "msg": "Wrong opration of crank end instruction for the token"
    }
  ]
};
