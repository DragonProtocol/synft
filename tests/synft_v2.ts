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

describe("synft v2", () => {
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
  let mint0 = null as PublicKey;
  let mint1 = null as PublicKey;
  let mint2 = null as PublicKey;
  let mint3 = null as PublicKey;
  let mint4 = null as PublicKey;
  let mint5 = null as PublicKey;
  let mint6 = null as PublicKey;
  let mint7 = null as PublicKey;
  let mint8 = null as PublicKey;

  let tokenAccount0 = null as Account;
  let tokenAccount1 = null as Account;
  let tokenAccount2 = null as Account;
  let tokenAccount3 = null as Account;
  let tokenAccount4 = null as Account;
  let tokenAccount5 = null as Account;
  let tokenAccount6 = null as Account;
  let tokenAccount7 = null as Account;
  let tokenAccount8 = null as Account;


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
    mint0 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );

    mint1 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint2 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint3 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint4 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint5 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint6 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint7 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint8 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    tokenAccount0 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint0,
      user1.publicKey,
      true
    );
    tokenAccount1 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint1,
      user1.publicKey,
      true
    );
    tokenAccount2 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint2,
      user1.publicKey,
      true
    );
    tokenAccount3 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint3,
      user1.publicKey,
      true
    );
    tokenAccount4 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint4,
      user1.publicKey,
      true
    );
    tokenAccount5 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint5,
      user1.publicKey,
      true
    );
    tokenAccount6 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint6,
      user2.publicKey,
      true
    );
    tokenAccount7 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint7,
      user1.publicKey,
      true
    );
    tokenAccount8 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint8,
      user1.publicKey,
      true
    );
    assert.ok(tokenAccount0.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount1.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount2.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount3.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount4.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount5.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount6.owner.toString() == user2.publicKey.toString());

    let signature0 = await mintTo(
      connection,
      payer,
      mint0,
      tokenAccount0.address,
      mintAuthority,
      1,
      []
    );
    let signature1 = await mintTo(
      connection,
      payer,
      mint1,
      tokenAccount1.address,
      mintAuthority,
      1,
      []
    );
    let signature2 = await mintTo(
      connection,
      payer,
      mint2,
      tokenAccount2.address,
      mintAuthority,
      1,
      []
    );
    let signature3 = await mintTo(
      connection,
      payer,
      mint3,
      tokenAccount3.address,
      mintAuthority,
      1,
      []
    );
    let signature4 = await mintTo(
      connection,
      payer,
      mint4,
      tokenAccount4.address,
      mintAuthority,
      1,
      []
    );
    let signature5 = await mintTo(
      connection,
      payer,
      mint5,
      tokenAccount5.address,
      mintAuthority,
      1,
      []
    );
    let signature6 = await mintTo(
      connection,
      payer,
      mint6,
      tokenAccount6.address,
      mintAuthority,
      1,
      []
    );
    let signature7 = await mintTo(
      connection,
      payer,
      mint7,
      tokenAccount7.address,
      mintAuthority,
      1,
      []
    );
    let signature8 = await mintTo(
      connection,
      payer,
      mint8,
      tokenAccount8.address,
      mintAuthority,
      1,
      []
    );
  });

  // Inject nft1 to  nft2, inject nft0 to  nft2
  //    nft2
  //   /   \
  // nft1, nft0
  it("Inject to root NFT", async () => {
    let connection = anchor.getProvider().connection;

    // Inject nft1 to  nft2
    const [_metadata_pda_2_1, _metadata_bump_2_1] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mint2.toBuffer(),
        mint1.toBuffer(),
      ],
      program.programId
    );
    const [_parent_pda, _parent_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mint2.toBuffer(),
      ],
      program.programId
    );
    let initTx = await program.rpc.injectToRootV2(
      true,
      _metadata_bump_2_1,
      _parent_bump,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount1.address,
          childMintAccount: mint1,
          parentTokenAccount: tokenAccount2.address,
          parentMintAccount: mint2,
          childrenMeta: _metadata_pda_2_1,
          parentMeta: _parent_pda,

          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
    // volidate metadata
    let childrenMeta = await program.account.childrenMetadataV2.fetch(
      _metadata_pda_2_1
    );
    assert.ok(childrenMeta.isMutable == true);
    assert.ok(childrenMeta.bump == _metadata_bump_2_1);
    assert.ok(childrenMeta.child.toString() == mint1.toString());

    // inject nft0 to  nft2
    const [_metadata_pda_2_0, _metadata_bump_2_0] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mint2.toBuffer(),
        mint0.toBuffer(),
      ],
      program.programId
    );
    let initTx1 = await program.rpc.injectToRootV2(
      true,
      _metadata_bump_2_0,
      _parent_bump,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount0.address,
          childMintAccount: mint0,
          parentTokenAccount: tokenAccount2.address,
          parentMintAccount: mint2,
          childrenMeta: _metadata_pda_2_0,
          parentMeta: _parent_pda,

          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
    // volidate metadata
    let childrenMeta_2_0 = await program.account.childrenMetadataV2.fetch(
      _metadata_pda_2_0
    );
    assert.ok(childrenMeta_2_0.isMutable == true);
    assert.ok(childrenMeta_2_0.bump == _metadata_bump_2_0);
    assert.ok(childrenMeta_2_0.child.toString() == mint0.toString());
  });

  // Inject nft4 to nft3,  inject nft5 to  nft4
  // nft3
  //  |  
  // nft4
  //  |
  // nft5
  it("Inject to non-root NFT", async () => {
    let connection = anchor.getProvider().connection;
    const [_root_metadata_pda, _root_metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mint3.toBuffer(),
        mint4.toBuffer(),
      ],
      program.programId
    );
    const [_nft3_parent_metadata_pda, _nft3_parent_metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mint3.toBuffer(),
      ],
      program.programId
    );
    let initTx1 = await program.rpc.injectToRootV2(
      true,
      _root_metadata_bump,
      _nft3_parent_metadata_bump,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount4.address,
          childMintAccount: mint4,
          parentTokenAccount: tokenAccount3.address,
          parentMintAccount: mint3,
          childrenMeta: _root_metadata_pda,
          parentMeta: _nft3_parent_metadata_pda,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );

    const [_child_metadata_pda, _child_metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mint4.toBuffer(),
        mint5.toBuffer(),
      ],
      program.programId
    );
    const [_nft4_parent_metadata_pda, _nft4_parent_metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mint4.toBuffer(),
      ],
      program.programId
    );
    let initTx2 = await program.rpc.injectToNonRootV2(
      true,
      _child_metadata_bump,
      _nft4_parent_metadata_bump,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount5.address,
          childMintAccount: mint5,
          parentTokenAccount: tokenAccount4.address,
          parentMintAccount: mint4,
          rootTokenAccount: tokenAccount3.address,
          rootMintAccount: mint3,
          childrenMeta: _child_metadata_pda,
          childrenMetaOfParent: _root_metadata_pda,
          rootMeta: _root_metadata_pda,
          parentMeta: _nft4_parent_metadata_pda,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
    // volidate metadata
    let childrenMeta = await program.account.childrenMetadataV2.fetch(
      _child_metadata_pda
    );
    assert.ok(childrenMeta.isMutable == true);
    assert.ok(childrenMeta.bump == _child_metadata_bump);
    assert.ok(childrenMeta.child.toString() == mint5.toString());
  });

  // Transfer NFT, transfer out nft5 to user2
  // user1        user2           
  //  |             |     
  // nft3         nft5    
  //  |            
  // nft4  >>>>     
  //  |
  // nft5
  it("Transfer NFT to user", async () => {
    let connection = anchor.getProvider().connection;
    const [_root_metadata_pda, _root_metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mint3.toBuffer(),
        mint4.toBuffer(),
      ],
      program.programId
    );
    const [_parent_meta_pda, _parent_metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        mint4.toBuffer(),
        mint5.toBuffer(),
      ],
      program.programId
    );

    let initTx = await program.rpc.transferChildNftV2(_parent_metadata_bump,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount5.address,
          childMintAccount: mint5,
          rootTokenAccount: tokenAccount3.address,
          rootMintAccount: mint3,
          childrenMetaOfParent: _parent_meta_pda,
          parentMintAccount: mint4,
          rootMeta: _root_metadata_pda,
          receiverAccount: user2.publicKey,

          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );

    let rootMeta = await program.account.childrenMetadataV2.fetchNullable(
      _root_metadata_pda
    );
    assert.isOk(rootMeta.isMutated == true);
    let parentMeta = await program.account.childrenMetadataV2.fetchNullable(
      _parent_meta_pda
    );
    assert.isOk(parentMeta.isMutated == true);
  });

  /**
   * Test: transfer SOL from user 1 to NFT 1
   * check the balance of user 1
   */
  it("Inject SOL", async () => {
    let connection = anchor.getProvider().connection;
    const [_sol_pda, _sol_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        mint2.toBuffer(),
      ],
      program.programId
    );

    const inject_sol_amount = 500000000;

    let user1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    const tokenAccount2Amount = user1Account.lamports;

    let initTx = await program.rpc.injectToSolV2(
      _sol_bump,
      new anchor.BN(inject_sol_amount),
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentTokenAccount: tokenAccount2.address,
          parentMintAccount: tokenAccount2.mint,
          solAccount: _sol_pda,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1],
      }
    );

    // volidate the balance of tokenAccount 1
    user1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);

    assert.ok(
      user1Account.lamports,
      Number(tokenAccount2Amount) - inject_sol_amount
    );

    let solAccount = await anchor
      .getProvider()
      .connection.getAccountInfo(_sol_pda);
    assert.ok(solAccount.lamports > inject_sol_amount);
  });

  it("Extract SOL", async () => {
    let connection = anchor.getProvider().connection;
    const [_sol_pda, _sol_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        mint2.toBuffer(),
      ],
      program.programId
    );
    // const [_root_metadata_pda, _root_metadata_bump] = await PublicKey.findProgramAddress(
    //   [
    //     Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
    //     mint2.toBuffer(),
    //     mint1.toBuffer(),
    //   ],
    //   program.programId
    // );
    getAccount(connection, _sol_pda); // account exists
    let extractTx = await program.rpc.extractSolV2(_sol_bump, {
      accounts: {
        currentOwner: user1.publicKey,
        parentTokenAccount: tokenAccount2.address,
        parentMintAccount: tokenAccount2.mint,
        solAccount: _sol_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [user1],
    });

    const solAccountUser = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    assert.ok(solAccountUser.lamports > 1500000000);

    let solAccount = await program.account.solAccount.fetchNullable(_sol_pda);
    assert.isNull(solAccount);
  });

  // Inject sol to nft2, burn nft2 for sol
  //    nft2
  //     |
  //    nft0 
  it("Burn for SOL", async () => {
    let connection = anchor.getProvider().connection;
    // inject sol to nft2
    const [_sol_pda, _sol_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        mint2.toBuffer(),
      ],
      program.programId
    );
    const [_parent_pda, _parent_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
        mint2.toBuffer(),
      ],
      program.programId
    );
    const inject_sol_amount = 500000000;
    let user1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    const tokenAccount2Amount = user1Account.lamports;
    let injectTx = await program.rpc.injectToSolV2(
      _sol_bump,
      new anchor.BN(inject_sol_amount),
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentTokenAccount: tokenAccount2.address,
          parentMintAccount: tokenAccount2.mint,
          solAccount: _sol_pda,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1],
      }
    );
    // volidate the balance of tokenAccount 1
    let injectedUser1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    assert.ok(
      injectedUser1Account.lamports,
      Number(tokenAccount2Amount) - inject_sol_amount
    );
    // burn nft2 for sol
    let burnTx = await program.rpc.burnV2(
      _sol_bump,
      _parent_bump,
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentMintAccount: tokenAccount2.mint,
          parentTokenAccount: tokenAccount2.address,
          parentMetadata: _parent_pda,
          solAccount: _sol_pda,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      });

    let solAccountAfter = await program.account.solAccount.fetchNullable(_sol_pda);
    assert.ok(solAccountAfter === null);
  });


  it("Build a tree with the most nfts", async () => {
    let connection = anchor.getProvider().connection;
    mint11 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint12 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint13 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint14 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint15 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint16 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint17 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint18 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint19 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint20 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint21 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint22 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    mint23 = await createMint(
      anchor.getProvider().connection,
      payer,
      mintAuthority.publicKey,
      mintAuthority.publicKey,
      0
    );
    tokenAccount11 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint11,
      user1.publicKey,
      true
    );
    tokenAccount12 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint12,
      user1.publicKey,
      true
    );
    tokenAccount13 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint13,
      user1.publicKey,
      true
    );
    tokenAccount14 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint14,
      user1.publicKey,
      true
    );
    tokenAccount15 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint15,
      user1.publicKey,
      true
    );
    tokenAccount16 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint16,
      user1.publicKey,
      true
    );
    tokenAccount17 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint17,
      user1.publicKey,
      true
    );
    tokenAccount18 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint18,
      user1.publicKey,
      true
    );
    tokenAccount19 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint19,
      user1.publicKey,
      true
    );
    tokenAccount20 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint20,
      user1.publicKey,
      true
    );
    tokenAccount21 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint21,
      user1.publicKey,
      true
    );
    tokenAccount22 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint22,
      user1.publicKey,
      true
    );
    tokenAccount23 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint23,
      user1.publicKey,
      true
    );
    let signature11 = await mintTo(
      connection,
      payer,
      mint11,
      tokenAccount11.address,
      mintAuthority,
      1,
      []
    );
    let signature12 = await mintTo(
      connection,
      payer,
      mint12,
      tokenAccount12.address,
      mintAuthority,
      1,
      []
    );
    let signature13 = await mintTo(
      connection,
      payer,
      mint13,
      tokenAccount13.address,
      mintAuthority,
      1,
      []
    );
    let signature14 = await mintTo(
      connection,
      payer,
      mint14,
      tokenAccount14.address,
      mintAuthority,
      1,
      []
    );
    let signature15 = await mintTo(
      connection,
      payer,
      mint15,
      tokenAccount15.address,
      mintAuthority,
      1,
      []
    );
    let signature16 = await mintTo(
      connection,
      payer,
      mint16,
      tokenAccount16.address,
      mintAuthority,
      1,
      []
    );
    let signature17 = await mintTo(
      connection,
      payer,
      mint17,
      tokenAccount17.address,
      mintAuthority,
      1,
      []
    );
    let signature18 = await mintTo(
      connection,
      payer,
      mint18,
      tokenAccount18.address,
      mintAuthority,
      1,
      []
    );
    let signature19 = await mintTo(
      connection,
      payer,
      mint19,
      tokenAccount19.address,
      mintAuthority,
      1,
      []
    );
    let signature20 = await mintTo(
      connection,
      payer,
      mint20,
      tokenAccount20.address,
      mintAuthority,
      1,
      []
    );
    let signature21 = await mintTo(
      connection,
      payer,
      mint21,
      tokenAccount21.address,
      mintAuthority,
      1,
      []
    );
    let signature22 = await mintTo(
      connection,
      payer,
      mint22,
      tokenAccount22.address,
      mintAuthority,
      1,
      []
    );
    let signature23 = await mintTo(
      connection,
      payer,
      mint23,
      tokenAccount23.address,
      mintAuthority,
      1,
      []
    ); 

    await injectRoot(tokenAccount11, mint11, tokenAccount12, mint12, program, user1);
    await injectRoot(tokenAccount11, mint11, tokenAccount13, mint13, program, user1);
    await injectRoot(tokenAccount11, mint11, tokenAccount14, mint14, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount12, mint12, tokenAccount15, mint15, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount12, mint12, tokenAccount16, mint16, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount12, mint12, tokenAccount17, mint17, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount13, mint13, tokenAccount18, mint18, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount13, mint13, tokenAccount19, mint19, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount13, mint13, tokenAccount20, mint20, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount14, mint14, tokenAccount21, mint21, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount14, mint14, tokenAccount22, mint22, program, user1);
    await injectNonRoot(tokenAccount11, mint11, tokenAccount14, mint14, tokenAccount23, mint23, program, user1);
  });
});

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
  let initTx2 = await program.rpc.injectToNonRootV2(
    true,
    _child_metadata_bump,
    _parent_metadata_bump,
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
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user],
    }
  );
}

async function injectRoot(parentToken, parentMint, childToken, childMint, program, user) {
  const [_metadata_pda_11_12, _metadata_bump_11_12] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
      parentMint.toBuffer(),
      childMint.toBuffer(),
    ],
    program.programId
  );
  const [_parent_pda_11, _parent_bump_11] = await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
      parentMint.toBuffer(),
    ],
    program.programId
  );
  let initTx = await program.rpc.injectToRootV2(
    true,
    _metadata_bump_11_12,
    _parent_bump_11,
    {
      accounts: {
        currentOwner: user.publicKey,
        childTokenAccount: childToken.address,
        childMintAccount: childMint,
        parentTokenAccount: parentToken.address,
        parentMintAccount: parentMint,
        childrenMeta: _metadata_pda_11_12,
        parentMeta: _parent_pda_11,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user],
    }
  );

}