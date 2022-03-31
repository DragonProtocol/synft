import { PublicKey } from "@solana/web3.js";
import { SynftProgram as program, findParentMetaPda, findChildrenMetaPda, findCrankMetaPda, UserKeypair } from "./common";
import * as anchor from "@project-serum/anchor";

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

const user1 = UserKeypair;

// ------------------------------------------------------------------------------------------------------

let fileExist = function (file) {
  const fs = require("fs");
  return fs.existsSync(file);
}

function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

const pubkey_array_len = function(a) {
  let cnt = 0
  for(const v of a) {
    if(v.toString() != PublicKey.default.toString()) { cnt += 1; }
  }
  return cnt;
}

const getTokenAccountByOwner = async function(owner) {
  //let connection = anchor.getProvider().connection;
  let response = await program.provider.connection.getTokenAccountsByOwner(
    owner, { programId: TOKEN_PROGRAM_ID, }
  );
  return response.value[0].pubkey;
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

let findProgramAddress = async function(seed, mint1, mint2) {
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
  return pda;
}

async function fetchAllParentMetadataPDAs(offset, bytes) {
  const filter: any = [];
  filter.push({
    memcmp: { offset: offset, bytes: bytes, },
  });
  const pdas = await program.account.parentMetadata.all(filter);
  return pdas;
}

// ------------------------------------------------------------------------------------------------------

async function fetchAllParentMetadataPDAs1() {
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


let deal_single_new_root = async function(mintP, mintC, tokenP, tokenC) {
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
}

// ------------------------------------------------------------------------------------------------------

async function doCrank() {
  const pdas = await fetchAllParentMetadataPDAs1();
  //console.log("pdas:", pdas);

  const doOne = async function(info) {
    console.log("\nfind parent: ", new Date(), "\n", info);

    const data = info.account;
    const tokenAccount = await getTokenAccountByOwner(info.publicKey);
    
    for(const child of data.immediateChildren) {
      if(child.toString() != PublicKey.default.toString()) {
        const childData = await fetchAccount("crank script", "parent-metadata-seed", child, null, "parentMetadata");
        const  childOwner = await findProgramAddress("children-of", data.selfMint,  childData.selfMint);
        const childTokenAccount = await getTokenAccountByOwner(childOwner);
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
    console.log("done...     ", new Date());
  };

  for(const pda of pdas) {
    await doOne(pda);
  }
}

// ------------------------------------------------------------------------------------------------------

async function main() {
  console.log("start burn cranking......");

  for(;;) {
    while(fileExist("stop")) { console.log("stopping..."); await sleep(3); }

    process.stdout.write(".");
    await sleep(3);

    try {
      await doCrank();
    } catch(e) { console.log("doCrank failed:", e); }
  }
}

main();

// ------------------------------------------------------------------------------------------------------

