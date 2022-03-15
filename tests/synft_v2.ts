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
  const mintAuthority = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  let mint0 = null as PublicKey;
  let mint1 = null as PublicKey;
  let mint2 = null as PublicKey;
  let mint3 = null as PublicKey;
  let mint4 = null as PublicKey;
  let mint5 = null as PublicKey;
  let tokenAccount0 = null as Account;
  let tokenAccount1 = null as Account;
  let tokenAccount2 = null as Account;
  let tokenAccount3 = null as Account;
  let tokenAccount4 = null as Account;
  let tokenAccount5 = null as Account;

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
    assert.ok(tokenAccount0.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount1.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount2.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount3.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount4.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount5.owner.toString() == user1.publicKey.toString());
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
    let initTx = await program.rpc.injectToRootV2(
      true,
      _metadata_bump_2_1,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount1.address,
          childMintAccount: mint1,
          parentTokenAccount: tokenAccount2.address,
          parentMintAccount: mint2,
          childrenMeta: _metadata_pda_2_1,

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
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount0.address,
          childMintAccount: mint0,
          parentTokenAccount: tokenAccount2.address,
          parentMintAccount: mint2,
          childrenMeta: _metadata_pda_2_0,

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
    let initTx1 = await program.rpc.injectToRootV2(
      true,
      _root_metadata_bump,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount4.address,
          childMintAccount: mint4,
          parentTokenAccount: tokenAccount3.address,
          parentMintAccount: mint3,
          childrenMeta: _root_metadata_pda,

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
    let initTx2 = await program.rpc.injectToNonRootV2(
      // `is_mutable` 
      true,
      // `is_mutated` set false now
      false,
      _child_metadata_bump,
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
          parentMeta: _root_metadata_pda,
          rootMeta: _root_metadata_pda,

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

  /**
   * Test: transfer SOL from user 1 to NFT 1
   * check the balance of user 1
   */
   it("Inject SOL", async () => {
    let connection = anchor.getProvider().connection;
    const [_sol_pda, _sol_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        mint1.toBuffer(),
      ],
      program.programId
    );

    const inject_sol_amount = 500000000;

    let user1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    const tokenAccount1Amount = user1Account.lamports;

    let initTx = await program.rpc.injectToSolV2(
      _sol_bump,
      new anchor.BN(inject_sol_amount),
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentTokenAccount: tokenAccount1.address,
          parentMintAccount : tokenAccount1.mint,
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
      Number(tokenAccount1Amount) - inject_sol_amount
    );

    let solAccount = await anchor
      .getProvider()
      .connection.getAccountInfo(_sol_pda);
    assert.ok(solAccount.lamports > inject_sol_amount);
  });
});
