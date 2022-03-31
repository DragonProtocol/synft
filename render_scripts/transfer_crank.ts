import { PublicKey } from "@solana/web3.js";
import { SynftProgram as program, findParentMetaPda, findChildrenMetaPda, findCrankMetaPda, UserKeypair } from "./common";
import * as anchor from "@project-serum/anchor";
async function doTransferCrank() {
  let mutatedPdas = await fetchAllchildrenMetadataV2PDAs();
  if (mutatedPdas.length == 0) {
    console.log("There're no transfering nfts now.");
  }
  let crankMutatedPdas = mutatedPdas.filter(pda => {
    return (pda.account.root.toBase58() == pda.publicKey.toBase58() && !mutatedPdas.map(p => {
      if (p.publicKey.toBase58() != pda.publicKey.toBase58()) {
        return p.account.root.toBase58()
      }
    }).includes(pda.publicKey.toBase58()))
      || (pda.account.root.toBase58() != pda.publicKey.toBase58());
  });

  crankMutatedPdas.forEach(async pda => {
    const [parentPda, parentBump] = await findParentMetaPda(pda.account.child)
    const [parentPdaOfParent, parentBumpOfParent] = await findParentMetaPda(pda.account.parent)
    const [crankPda, crankBump] = await findCrankMetaPda(pda.account.child)

    let parentMeta = await program.account.parentMetadata.fetch(parentPda);
    if (parentMeta.immediateChildren.every(child => child.toBase58() == PublicKey.default.toBase58())) {
      console.log("No children branch, parentMeta:", parentMeta);
      // 1. 没有孩子的 执行init、end
      //   a. root指向自己的，说明是前两层
      //   b. root不指向自己，说明是后两层
      let initTx = await program.rpc.transferCrankInitV2(
        {
          accounts: {
            operator: UserKeypair.publicKey,
            childMintAccount: pda.account.child,
            childrenMetaOfParent: pda.publicKey,
            childrenMetaOfRoot: pda.account.root,
            parentMeta: parentPda,
            parentMetaOfParent: parentPdaOfParent,
            crankMeta: crankPda,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [UserKeypair],
        }
      );
      console.log("initTx:", initTx);

      let endTx = await program.rpc.transferCrankEndV2(
        {
          accounts: {
            operator: UserKeypair.publicKey,
            childrenMetaOfRoot: pda.account.root,
            childrenMetaOfClose: pda.publicKey,
            parentMeta: parentPda,
            crankMeta: crankPda,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [UserKeypair],
        }
      );
      console.log("endTx:", endTx);
    } else {
      // 2.有孩子的
      //   a. 有两层， 需要执行init、process、end
      console.log("Own children branch, parentMeta:", parentMeta);
      let initTx = await program.rpc.transferCrankInitV2(
        {
          accounts: {
            operator: UserKeypair.publicKey,
            childMintAccount: pda.account.child,
            childrenMetaOfParent: pda.publicKey,
            childrenMetaOfRoot: pda.publicKey,
            parentMeta: parentPda,
            parentMetaOfParent: parentPdaOfParent,
            crankMeta: crankPda,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [UserKeypair],
        }
      );
      console.log("initTx:", initTx);
      let processMap = parentMeta.immediateChildren.filter(child => child.toBase58() != PublicKey.default.toBase58()).map(async child => {
        const [childrenMetaPda, childrenMetaBump] = await findChildrenMetaPda(pda.account.child, child)
        const [parentPdaOfChild, parentBumpOfChild] = await findParentMetaPda(child)
        let processTx = await program.rpc.transferCrankProcessV2(
          {
            accounts: {
              operator: UserKeypair.publicKey,
              childMintAccount: child,
              childrenMeta: childrenMetaPda,
              parentMeta: parentPdaOfChild,
              parentMetaOfParent: parentPda,
              crankMeta: crankPda,
              systemProgram: anchor.web3.SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            },
            signers: [UserKeypair],
          }
        );
        return processTx;
      });

      let ret = await Promise.all(processMap);
      const anyLeaf = parentMeta.immediateChildren.filter(child => child.toBase58() != PublicKey.default.toBase58())[0];
      const [parentPdaOfLeaf, parentBumpOfLeaf] = await findParentMetaPda(anyLeaf)
      let endTx = await program.rpc.transferCrankEndV2(
        {
          accounts: {
            operator: UserKeypair.publicKey,
            childrenMetaOfRoot: pda.publicKey,
            childrenMetaOfClose: pda.publicKey,
            parentMeta: parentPdaOfLeaf,
            crankMeta: crankPda,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
          signers: [UserKeypair],
        }
      );
      console.log("endTx:", endTx);
      console.log("pda.publicKey:", pda.publicKey);
    }
  })
}

async function fetchAllchildrenMetadataV2PDAs() {
  const filter: any = [];
  const Base58 = require('base58');
  filter.push({
    memcmp: {
      offset: 106, //need to prepend 106 bytes for ChildrenMetadataV2 is_mutated
      bytes: Base58.int_to_base58(1),
    },
  });
  const pdas = await program.account.childrenMetadataV2.all(filter);
  console.log("NFT ready for processing, length:", pdas.length, ",data:", pdas);
  pdas.forEach(element => {
    console.log("pda.account:", element.account);
  });
  return pdas;
}