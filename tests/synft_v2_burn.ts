import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  Commitment,
} from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
  getAccount,
  Account,
  setAuthority,
  AuthorityType,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import { Synft } from "../target/types/synft";
import { assert, expect } from "chai";
import { token } from "@project-serum/anchor/dist/cjs/utils";

import axios from "axios";
import { programs } from "@metaplex/js";


const {
  metadata: { Metadata },
} = programs;

var MPL_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export interface INFT {
  pubkey?: PublicKey;
  mint: PublicKey;
  onchainMetadata: unknown;
  externalMetadata: unknown;
}

async function getNFTMetadata(
  mint: string,
  conn: Connection,
  pubkey?: string
): Promise<INFT | undefined> {
  try {
    const metadataPDA = await Metadata.getPDA(mint);
    const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data;
    const externalMetadata = (await axios.get(onchainMetadata.data.uri)).data;
    return {
      pubkey: pubkey ? new PublicKey(pubkey) : undefined,
      mint: new PublicKey(mint),
      onchainMetadata,
      externalMetadata,
    };
  } catch (e) {
    console.log(`failed to pull metadata for token ${mint}`);
  }
}

describe("synft v2 burn", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.Synft as Program<Synft>;

  /**
   * Prepare Initial State:
   * - user 1
   * - NFT 0 owned by user 1
   * - NFT 1 owned by user 1
   * - NFT 2 owned by user 1
   * - NFT 3 owned by user 1
   * - NFT 4 owned by user 1
   * - NFT 5 owned by user 1
   */
  const user1 = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();
  const mintAuthority = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();

  let mint11 = null as PublicKey;
  let mint12 = null as PublicKey;
  let mint13 = null as PublicKey;
  let mint14 = null as PublicKey;
  let mint15 = null as PublicKey;
  let mint16 = null as PublicKey;
  let mint17 = null as PublicKey;
  let mint18 = null as PublicKey;
  let mint19 = null as PublicKey;
  let mint20 = null as PublicKey;
  let mint21 = null as PublicKey;
  let mint22 = null as PublicKey;
  let mint23 = null as PublicKey;
  let tokenAccount11 = null as Account;
  let tokenAccount12 = null as Account;
  let tokenAccount13 = null as Account;
  let tokenAccount14 = null as Account;
  let tokenAccount15 = null as Account;
  let tokenAccount16 = null as Account;
  let tokenAccount17 = null as Account;
  let tokenAccount18 = null as Account;
  let tokenAccount19 = null as Account;
  let tokenAccount20 = null as Account;
  let tokenAccount21 = null as Account;
  let tokenAccount22 = null as Account;
  let tokenAccount23 = null as Account;

  it("Is initialized!", async () => {
    let connection = anchor.getProvider().connection;
    await anchor
      .getProvider()
      .connection.confirmTransaction(
        await anchor
          .getProvider()
          .connection.requestAirdrop(payer.publicKey, 100000000000),
        "processed"
      );
    await anchor
      .getProvider()
      .connection.confirmTransaction(
        await anchor
          .getProvider()
          .connection.requestAirdrop(user1.publicKey, 5000000000),
        "processed"
      );
    await anchor
      .getProvider()
      .connection.confirmTransaction(
        await anchor
          .getProvider()
          .connection.requestAirdrop(user2.publicKey, 5000000000),
        "processed"
      );
    await anchor
      .getProvider()
      .connection.confirmTransaction(
        await anchor
          .getProvider()
          .connection.requestAirdrop(mintAuthority.publicKey, 1000000000),
        "processed"
      );

    let payerAmount = await anchor
      .getProvider()
      .connection.getBalance(payer.publicKey);
    assert.ok(payerAmount == 100000000000);
  });


  it("Initialize a tree with the most nfts", async () => {
    mint11 = await _createMint(payer, mintAuthority);
    mint12 = await _createMint(payer, mintAuthority);
    mint13 = await _createMint(payer, mintAuthority);
    mint15 = await _createMint(payer, mintAuthority);
    mint16 = await _createMint(payer, mintAuthority);

    tokenAccount11 = await _getOrCreateAssociatedTokenAccount(payer, mint11, user1);
    tokenAccount12 = await _getOrCreateAssociatedTokenAccount(payer, mint12, user1);
    tokenAccount13 = await _getOrCreateAssociatedTokenAccount(payer, mint13, user1);
    tokenAccount15 = await _getOrCreateAssociatedTokenAccount(payer, mint15, user1);
    tokenAccount16 = await _getOrCreateAssociatedTokenAccount(payer, mint16, user1);

    await _mintTo(payer, mint11, tokenAccount11, mintAuthority, 1);
    await _mintTo(payer, mint12, tokenAccount12, mintAuthority, 1);
    await _mintTo(payer, mint13, tokenAccount13, mintAuthority, 1);
    await _mintTo(payer, mint15, tokenAccount15, mintAuthority, 1);
    await _mintTo(payer, mint16, tokenAccount16, mintAuthority, 1);

    await injectRoot(tokenAccount11, mint11, tokenAccount12, mint12, program, user1);
    await injectRoot(tokenAccount11, mint11, tokenAccount13, mint13, program, user1);

    await injectNonRoot(tokenAccount11, mint11, tokenAccount12, mint12, tokenAccount15, mint15, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount12, mint12, tokenAccount16, mint16, program, user1);
  });

  let start_burn = async function(mint, token) {
    let connection = anchor.getProvider().connection;

    const [_rootMetadata, _a] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mint.toBuffer(),
      ],
      program.programId
    );

    const [_solAccount, _b] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        mint.toBuffer(),
      ],
      program.programId
    );

    const [_oldRootOwner, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("root-owner-seed")),
        mint.toBuffer(),
      ],
      program.programId
    );

    let initTx = await program.rpc.startBurn(
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentMintAccount: mint,
          parentTokenAccount: token.address,
          parentMetadata: _rootMetadata,
          solAccount: _solAccount,
          oldRootOwner: _oldRootOwner,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
  }

  let deal_single_new_root = async function(mintP, mintC, tokenP, tokenC) {
    let connection = anchor.getProvider().connection;

    const [_parentMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintP.toBuffer(),
      ],
      program.programId
    );

    const [_childMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintC.toBuffer(),
      ],
      program.programId
    );

    const [_childrenMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mintP.toBuffer(),
        mintC.toBuffer(),
      ],
      program.programId
    );
    const [_oldRootOwner, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("root-owner-seed")),
        mintP.toBuffer(),
      ],
      program.programId
    );

    let initTx = await program.rpc.dealSingleNewRoot(
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentToken: tokenP.address,
          childToken: tokenC.address,
          parentMint: mintP,
          childMint: mintC,
          parentMetadata: _parentMetadata,
          childMetadata:_childMetadata,
          childrenMetadata: _childrenMetadata,
          oldRootOwner: _oldRootOwner,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
  }

  let start_branch = async function(mintP, mintC, tokenP, tokenC, mintGrandson) {
    let connection = anchor.getProvider().connection;

    const [_parentMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintP.toBuffer(),
      ],
      program.programId
    );

    const [_childMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintC.toBuffer(),
      ],
      program.programId
    );

    const [_childrenMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mintP.toBuffer(),
        mintC.toBuffer(),
      ],
      program.programId
    );

    const [_crankMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("crank-seed")),
        mintGrandson.toBuffer(),
      ],
      program.programId
    );

    const [_grandsonMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintGrandson.toBuffer(),
      ],
      program.programId
    );

    const [_grandsonChildrenMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mintC.toBuffer(),
        mintGrandson.toBuffer(),
      ],
      program.programId
    );

    const [_newRootInfo, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("new-root-info-seed")),
        mintC.toBuffer(),
      ],
      program.programId
    );

    const [_branchInfo, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("branch-info-seed")),
        mintC.toBuffer(),
        mintGrandson.toBuffer(),
      ],
      program.programId
    );
    const [_oldRootOwner, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("root-owner-seed")),
        mintP.toBuffer(),
      ],
      program.programId
    );

    let initTx = await program.rpc.startBranch(
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentToken: tokenP.address,
          childToken: tokenC.address,
          parentMint: mintP,
          childMint: mintC,
          parentMetadata: _parentMetadata,
          childMetadata:_childMetadata,
          childrenMetadata: _childrenMetadata,
          grandsonMint: mintGrandson,
          grandsonMetadata: _grandsonMetadata,
          grandsonChildrenMetadata: _grandsonChildrenMetadata,
          crankMetadata: _crankMetadata,
          newRootInfo: _newRootInfo,
          branchInfo: _branchInfo,
          oldRootOwner: _oldRootOwner,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
  }

  let update_branch = async function(mintP, mintC, mintOldRoot, mintNewRoot, tokenOldRoot, tokenNewRoot, mintGrandson) {
    let connection = anchor.getProvider().connection;

    const [_childMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintC.toBuffer(),
      ],
      program.programId
    );

    const [_childrenMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mintP.toBuffer(),
        mintC.toBuffer(),
      ],
      program.programId
    );

    const [_oldRootMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintOldRoot.toBuffer(),
      ],
      program.programId
    );

    const [_newRootMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mintNewRoot.toBuffer(),
      ],
      program.programId
    );

    const [_rootChildrenMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mintOldRoot.toBuffer(),
        mintNewRoot.toBuffer(),
      ],
      program.programId
    );

    const [_crankMetadata, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("crank-pda-seed")),
        mintGrandson.toBuffer(),
      ],
      program.programId
    );

    const [_newRootInfo, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("new-root-info-seed")),
        mintNewRoot.toBuffer(),
      ],
      program.programId
    );

    const [_branchInfo, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("branch-info-seed")),
        mintNewRoot.toBuffer(),
        mintGrandson.toBuffer(),
      ],
      program.programId
    );

    const [_oldRootOwner, ] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("root-owner-seed")),
        mintOldRoot.toBuffer(),
      ],
      program.programId
    );

    let initTx = await program.rpc.updateBranch(
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentMint: mintP,
          childMint: mintC,
          childMetadata: _childMetadata,
          childrenMetadata: _childrenMetadata,

          oldRootMint: mintOldRoot,
          oldRootToken: tokenOldRoot.address,
          oldRootMetadata: _oldRootMetadata,

          newRootMint: mintNewRoot,
          newRootToken: tokenNewRoot.address,
          newRootMetadata: _newRootMetadata,
          rootChildrenMetadata: _rootChildrenMetadata,

          grandsonMint: mintGrandson,
          crankMetadata: _crankMetadata,
          newRootInfo: _newRootInfo,
          branchInfo: _branchInfo,
          oldRootOwner: _oldRootOwner,

          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
    console.log("newRootMetadata:", _newRootMetadata);
  }

  let fetchAccount = async function(title, seed, mint1, mint2, account) {
    let arr;
    if(mint2) {
      arr = [
        Buffer.from(anchor.utils.bytes.utf8.encode(seed)),
        mint1.toBuffer(),
        mint2.toBuffer(),
      ];
    } else {
      arr = [
        Buffer.from(anchor.utils.bytes.utf8.encode(seed)),
        mint1.toBuffer(),
      ];
    }
    const [pda, ] = await PublicKey.findProgramAddress(arr, program.programId);
    let data = await program.account[account].fetch(pda);
    data.address = pda;
    // console.log(title, account, data);
    return data;
  }

  let checkNonExistAccount = async function(title, seed, mint1, mint2, account) {
    try {
      const data = await fetchAccount(title, seed, mint1, mint2, account);
      console.log("checkNonExistAccount failed:", data);
      return false;
    } catch(e) {
      console.log("checkNonExistAccount:", e);
      return true;
    }
  }

  let getAccountInfo = async function(account) {
    let connection = anchor.getProvider().connection;
    return await getAccount(connection, account); 
  }

  async function fetchAllParentMetadataPDAs() {
    const Base58 = require('base58');

    const filter: any = [];
    filter.push({
      memcmp: {
        offset: 8+1, 
        bytes: Base58.int_to_base58(1),
      },
    });
    const pdas = await program.account.parentMetadata.all(filter);
    return pdas;
  }

  const pubkey_array_len = function(a) {
    let cnt = 0
    for(const v of a) {
      if(v.toString() != PublicKey.default.toString()) { cnt += 1; }
    }
    return cnt;
  }

  async function doCrank() {
    const pdas = await fetchAllParentMetadataPDAs();
    console.log("pdas:", pdas);

    const doOne = async function(info) {
      const data = info.account;
      console.log("data:", data);
      const tokenAccount = await _getAssociatedTokenAddress(data.selfMint, user1);
      const pubkey = info.publicKey;
      
      for(const child of data.immediateChildren) {
        if(child.toString() != PublicKey.default.toString()) {
          const childData = await fetchAccount("crank script", "parent-metadata-seed", child, null, "parentMetadata");
          const childTokenAccount = await _getAssociatedTokenAddress(childData.selfMint, user1);
          if(0 == pubkey_array_len(childData.immediateChildren)) {
            await deal_single_new_root(data.selfMint, childData.selfMint, {address: tokenAccount}, {address: childTokenAccount});
          } else {
            for(const grandson of childData.immediateChildren) {
              if(grandson.toString() != PublicKey.default.toString()) {
                await start_branch(data.selfMint, childData.selfMint, {address: tokenAccount}, {address: childTokenAccount}, grandson);
              }
            }
          }
        }
      }
    };

    for(const pda of pdas) {
      await doOne(pda);
    }
  }

  it("start burn", async () => {
    console.log("user1:", user1.publicKey);
    console.log("mint11:", mint11);
    console.log("mint12:", mint12);
    console.log("mint13:", mint13);
    console.log("token11:", tokenAccount11.address);
    console.log("token12:", tokenAccount12.address);
    console.log("token13:", tokenAccount13.address);
    
    await start_burn(mint11, tokenAccount11);
  });

  it("crank scripts", async () => {
    await doCrank();
  });

  // it("deal single new root", async () => {
  //   await deal_single_new_root(mint11, mint13, tokenAccount11, tokenAccount13);
  //   await fetchAccount("mint11 parent metadata", "parent-metadata-seed", mint11, null, "parentMetadata");
  // });

  // it("start branch 1", async () => {
  //   await start_branch(mint11, mint12, tokenAccount11, tokenAccount12, mint15);
  // });

  // it("start branch 2", async () => {
  //   await start_branch(mint11, mint12, tokenAccount11, tokenAccount12, mint16);
  // });

  it("do all assert", async () => {
    const p12 = await fetchAccount("mint12 parent metadata", "parent-metadata-seed", mint12, null, "parentMetadata");
    const p13 = await fetchAccount("mint13 parent metadata", "parent-metadata-seed", mint13, null, "parentMetadata");
    const p15 = await fetchAccount("mint15 parent metadata", "parent-metadata-seed", mint15, null, "parentMetadata");
    const p16 = await fetchAccount("mint16 parent metadata", "parent-metadata-seed", mint16, null, "parentMetadata");

    const a12 = await getAccountInfo(tokenAccount12.address);
    const a13 = await getAccountInfo(tokenAccount13.address);
    const a15 = await getAccountInfo(tokenAccount15.address);
    const a16 = await getAccountInfo(tokenAccount16.address);

    const c15 = await fetchAccount("15 children metadata", "children-of", mint12, mint15, "childrenMetadataV2");
    const c16 = await fetchAccount("16 children metadata", "children-of", mint12, mint16, "childrenMetadataV2");

    assert.ok(a12.owner.toString() == user1.publicKey.toString());
    assert.ok(a13.owner.toString() == user1.publicKey.toString());

    assert.ok(c15.root.toString() == c15.address.toString());
    assert.ok(c16.root.toString() == c16.address.toString());

    assert.ok(p12.height == 1);
    assert.ok(p13.height == 1);
    assert.ok(p15.height == 2);
    assert.ok(p16.height == 2);

    assert.ok(checkNonExistAccount("11 sol account", "sol-seed", mint11, null, "solAccount"));
    assert.ok(checkNonExistAccount("11 parent metadata", "parent-metadata-seed", mint11, null, "parentMetadata"));
    assert.ok(checkNonExistAccount("12 children metadata", "children-of", mint11, mint12, "childrenMetadataV2"));
    assert.ok(checkNonExistAccount("13 children metadata", "children-of", mint11, mint13, "childrenMetadataV2"));
  });


  // it("update branch 1", async () => {
  //   await update_branch(mint12, mint15, mint11, mint12, tokenAccount11, tokenAccount12);
  // });

  // it("update branch 2", async () => {
  //   await update_branch(mint12, mint16, mint11, mint12, tokenAccount11, tokenAccount12);
  // });


});


async function _mintTo(payer, mint, tokenAccount, mintAuthority, amount) {
  await mintTo(
    anchor.getProvider().connection,
    payer,
    mint,
    tokenAccount.address,
    mintAuthority,
    amount,
    []
  );
}
async function _getOrCreateAssociatedTokenAccount(payer, mint, user) {
  return await getOrCreateAssociatedTokenAccount(
    anchor.getProvider().connection,
    payer,
    mint,
    user.publicKey,
    true
  );
}

async function _getAssociatedTokenAddress(mint, user) {
  return await getAssociatedTokenAddress(
    mint,
    user.publicKey,
    true
  );
}

async function _createMint(payer, mintAuthority) {
  return await createMint(
    anchor.getProvider().connection,
    payer,
    mintAuthority.publicKey,
    mintAuthority.publicKey,
    0
  );
}

async function injectNonRoot(rootToken, rootMint, parentToken, parentMint, childToken, childMint, program, user) {
  const [_root_metadata_pda, _root_metadata_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
      rootMint.toBuffer(),
      parentMint.toBuffer(),
    ],
    program.programId
  );
  const [_child_metadata_pda, _child_metadata_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
      parentMint.toBuffer(),
      childMint.toBuffer(),
    ],
    program.programId
  );
  const [_parent_metadata_pda, _parent_metadata_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
      parentMint.toBuffer(),
    ],
    program.programId
  );
  const [_parent_metadata_of_child_pda, _parent_metadata_of_child_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
      childMint.toBuffer(),
    ],
    program.programId
  );
  let initTx2 = await program.rpc.injectToNonRootV2(
    true,
    _child_metadata_bump,
    _parent_metadata_of_child_bump,
    {
      accounts: {
        currentOwner: user.publicKey,
        childTokenAccount: childToken.address,
        childMintAccount: childMint,
        parentTokenAccount: parentToken.address,
        parentMintAccount: parentMint,
        rootTokenAccount: rootToken.address,
        rootMintAccount: rootMint,
        childrenMeta: _child_metadata_pda,
        childrenMetaOfParent: _root_metadata_pda,
        rootMeta: _root_metadata_pda,
        parentMeta: _parent_metadata_pda,
        parentMetaOfChild: _parent_metadata_of_child_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user],
    }
  );
}

async function injectRoot(parentToken, parentMint, childToken, childMint, program, user) {
  const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
      parentMint.toBuffer(),
      childMint.toBuffer(),
    ],
    program.programId
  );
  const [_parent_meta_pda, _parent_meta_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
      parentMint.toBuffer(),
    ],
    program.programId
  );
  const [_parent_meta_of_child_pda, _parent_meta_of_child_bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
      childMint.toBuffer(),
    ],
    program.programId
  );
  let initTx = await program.rpc.injectToRootV2(
    true,
    _metadata_bump,
    _parent_meta_bump,
    _parent_meta_of_child_bump,
    {
      accounts: {
        currentOwner: user.publicKey,
        childTokenAccount: childToken.address,
        childMintAccount: childMint,
        parentTokenAccount: parentToken.address,
        parentMintAccount: parentMint,
        childrenMeta: _metadata_pda,
        parentMeta: _parent_meta_pda,
        parentMetaOfChild: _parent_meta_of_child_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user],
    }
  );

}