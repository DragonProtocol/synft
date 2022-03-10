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
  // console.log('Pulling metadata for:', mint);
  try {
    const metadataPDA = await Metadata.getPDA(mint);
    const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data;
    console.log("onchainMetadata.data.uri:", onchainMetadata.data.uri);
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

describe("synft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Synft as Program<Synft>;

  /**
   * Prepare Initial State:
   * - user 1
   * - user 2
   * - NFT 1 owned by user 1
   * - NFT 2 owned by user 2
   */
  const user1 = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();
  const user3 = anchor.web3.Keypair.generate();
  const user4 = anchor.web3.Keypair.generate();
  const user5 = anchor.web3.Keypair.generate();
  const mintAuthority = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  let mint1 = null;
  let mint2 = null;
  let mint3 = null;
  let mint4 = null;
  let mint5 = null as PublicKey;
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
          .connection.requestAirdrop(payer.publicKey, 1000000000),
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
          .connection.requestAirdrop(user2.publicKey, 1000000000),
        "processed"
      );
    await anchor
      .getProvider()
      .connection.confirmTransaction(
        await anchor
          .getProvider()
          .connection.requestAirdrop(user3.publicKey, 1000000000),
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
    assert.ok(payerAmount == 1000000000);

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
      user2.publicKey,
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
      user2.publicKey,
      true
    );
    tokenAccount5 = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint5,
      user5.publicKey,
      true
    );
    assert.ok(tokenAccount1.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount2.owner.toString() == user2.publicKey.toString());
    assert.ok(tokenAccount3.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount4.owner.toString() == user2.publicKey.toString());
    assert.ok(tokenAccount5.owner.toString() == user5.publicKey.toString());
    let signature1 = await mintTo(
      connection,
      payer,
      mint1,
      tokenAccount1.address,
      mintAuthority,
      10,
      []
    );
    console.log("mint tx 1 :", signature1);
    let signature2 = await mintTo(
      connection,
      payer,
      mint2,
      tokenAccount2.address,
      mintAuthority,
      10,
      []
    );
    console.log("mint tx 2 :", signature2);
    let signature3 = await mintTo(
      connection,
      payer,
      mint3,
      tokenAccount3.address,
      mintAuthority,
      10,
      []
    );
    console.log("mint tx 3 :", signature3);
    let signature4 = await mintTo(
      connection,
      payer,
      mint4,
      tokenAccount4.address,
      mintAuthority,
      10,
      []
    );
    console.log("mint tx 4 :", signature4);
    let signature5 = await mintTo(
      connection,
      payer,
      mint5,
      tokenAccount5.address,
      mintAuthority,
      10,
      []
    );
    console.log("mint tx 5 :", signature5);
  });

  /**
   * Test: transfer fungible token from user1 to NFT
   *
   */
  it("Inject fungible token", async () => {
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());
    console.log("_metadata_bump is", _metadata_bump);

    const inject_fungible_token_amount = 1;
    const [_fungible_token_pda, _fungible_token_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("fungible-token-seed")),
          tokenAccount2.address.toBuffer(),
        ],
        program.programId
      );
    console.log("_fungible_token_pda is ", _fungible_token_pda.toString());
    console.log("_fungible_token_bump is", _fungible_token_bump);

    tokenAccount1 = await getAccount(connection, tokenAccount1.address);
    console.log("tokenAccount1 amount is", tokenAccount1.amount);
    const tokenAccount1Amount = tokenAccount1.amount;

    let initTx = await program.rpc.initializeFungibleTokenInject(
      true,
      _metadata_bump,
      new anchor.BN(inject_fungible_token_amount),
      {
        accounts: {
          currentOwner: user1.publicKey,
          ownerTokenAccount: tokenAccount1.address,
          parentTokenAccount: tokenAccount2.address,
          childrenMeta: _metadata_pda,
          mint: mint1,
          fungibleTokenAccount: _fungible_token_pda,

          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user1],
      }
    );
    console.log("initTx :", initTx);
    console.log("_fungible_token_pda :", _fungible_token_pda);

    // volidate the balance of tokenAccount 1
    tokenAccount1 = await getAccount(connection, tokenAccount1.address);
    assert.ok(
      tokenAccount1.amount,
      Number(tokenAccount1Amount) - inject_fungible_token_amount
    );

    // volidate metadata
    let childrenMeta = await program.account.childrenMetadata.fetch(
      _metadata_pda
    );
    assert.ok(childrenMeta.reversible == true);
    assert.ok(childrenMeta.bump == _metadata_bump);
    assert.ok(childrenMeta.child.toString() == _fungible_token_pda.toString());

    // volidate the balance of fungible token account
    const fungibleTokenAccount = await getAccount(
      connection,
      _fungible_token_pda
    );
    assert.ok(fungibleTokenAccount.amount, inject_fungible_token_amount);

    // volidate the owner of fungible token account, the owner is metadata pda
    assert.ok(fungibleTokenAccount.owner.equals(_metadata_pda));
  });

  it("Extract fungible token to user 2", async () => {
    console.log("Extracting");
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());

    const [_fungible_token_pda, _fungible_token_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("fungible-token-seed")),
          tokenAccount2.address.toBuffer(),
        ],
        program.programId
      );
    console.log("_fungible_token_pda is ", _fungible_token_pda.toString());
    console.log("_fungible_token_bump is", _fungible_token_bump);

    getAccount(connection, _metadata_pda); // account exists
    let extractTx = await program.rpc.extract(_metadata_bump, {
      accounts: {
        currentOwner: user2.publicKey,
        childTokenAccount: _fungible_token_pda,
        parentTokenAccount: tokenAccount2.address,
        childrenMeta: _metadata_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user2],
    });
    console.log("extractTx :", extractTx);
    try {
      getAccount(connection, _metadata_pda);
    } catch (error: any) {
      assert.ok(error.message == "TokenAccountNotFoundError");
    }
  });

  /**
   * Test: transfer SOL from user 1 to NFT 2
   * check the balance of user 1
   */
  it("Inject SOL", async () => {
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());
    console.log("_metadata_bump is", _metadata_bump);

    const inject_sol_amount = 500000000;
    const [_sol_pda, _sol_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_sol_pda is ", _sol_pda.toString());
    console.log("_sol_bump is", _sol_bump);

    let user1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    console.log("tokenAccount1 lamports is", user1Account.lamports);
    const tokenAccount1Amount = user1Account.lamports;

    let initTx = await program.rpc.initializeSolInject(
      true,
      _metadata_bump,
      new anchor.BN(inject_sol_amount),
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentTokenAccount: tokenAccount2.address,
          childrenMeta: _metadata_pda,

          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1],
      }
    );
    console.log("initTx :", initTx);
    console.log("_sol_pda :", _sol_pda);

    // volidate the balance of tokenAccount 1
    user1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    console.log("tokenAccount1 lamports is", user1Account.lamports);

    assert.ok(
      user1Account.lamports,
      Number(tokenAccount1Amount) - inject_sol_amount
    );

    // volidate metadata
    let childrenMeta = await program.account.childrenMetadata.fetch(
      _metadata_pda
    );
    assert.ok(childrenMeta.reversible == true);
    assert.ok(childrenMeta.bump == _metadata_bump);

    let metaAccount = await anchor
      .getProvider()
      .connection.getAccountInfo(_metadata_pda);
    assert.ok(metaAccount.lamports > inject_sol_amount);
  });

  it("Extract SOL to user 2", async () => {
    console.log("Extracting");
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());

    const [_sol_pda, _sol_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_sol_pda is ", _sol_pda.toString());
    console.log("_sol_bump is", _sol_bump);
    const solAccount = await anchor
      .getProvider()
      .connection.getAccountInfo(user2.publicKey);
    console.log("solAccount.lamports ", solAccount.lamports);

    getAccount(connection, _metadata_pda); // account exists
    let extractTx = await program.rpc.extractSol(_sol_bump, {
      accounts: {
        currentOwner: user2.publicKey,
        parentTokenAccount: tokenAccount2.address,
        childrenMeta: _metadata_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [user2],
    });
    console.log("extractTx :", extractTx);
    const solAccountUser2 = await anchor
      .getProvider()
      .connection.getAccountInfo(user2.publicKey);
    console.log("solAccountUser2.lamports ", solAccountUser2.lamports);
    assert.ok(solAccountUser2.lamports > 1500000000);


    let metaDataAfter = await program.account.childrenMetadata.fetchNullable(_metadata_pda);
    assert.ok(metaDataAfter === null);
  });

  it("Burn Parent Token and withdraw SOL to user 2", async () => {
    
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());
    console.log("_metadata_bump is", _metadata_bump);

    const inject_sol_amount = 500000000;
    const [_sol_pda, _sol_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("sol-seed")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_sol_pda is ", _sol_pda.toString());
    console.log("_sol_bump is", _sol_bump);

    let user1Account = await anchor
      .getProvider()
      .connection.getAccountInfo(user1.publicKey);
    console.log("tokenAccount1 lamports is", user1Account.lamports);
    const tokenAccount1Amount = user1Account.lamports;

    let initTx = await program.rpc.initializeSolInject(
      true,
      _metadata_bump,
      new anchor.BN(inject_sol_amount),
      {
        accounts: {
          currentOwner: user1.publicKey,
          parentTokenAccount: tokenAccount2.address,
          childrenMeta: _metadata_pda,

          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [user1],
      }
    );

    const metaSolAccount = await anchor
      .getProvider()
      .connection.getAccountInfo(_metadata_pda);
    assert.ok(metaSolAccount.lamports >= inject_sol_amount);

    getAccount(connection, _metadata_pda); // account exists
    let extractTx = await program.rpc.burnForSol({
      accounts: {
        currentOwner: user2.publicKey,
        parentTokenMint: tokenAccount2.mint,
        parentTokenAccount: tokenAccount2.address,
        childrenMeta: _metadata_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user2],
    });
    const solAccountUser2 = await anchor
      .getProvider()
      .connection.getAccountInfo(user2.publicKey);
    console.log("solAccountUser2.lamports ", solAccountUser2.lamports);
    assert.ok(solAccountUser2.lamports > 2000000000);


    let metaDataAfter = await program.account.childrenMetadata.fetchNullable(_metadata_pda);
    assert.ok(metaDataAfter === null);
  });

  it("Burn Parent Token and withdraw SPL to user 2", async () => {
    
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());
    console.log(_metadata_bump);
    console.log("DONE");
    let initTx = await program.rpc.initializeInject(false, _metadata_bump, {
      accounts: {
        currentOwner: user1.publicKey,
        childTokenAccount: tokenAccount1.address,
        parentTokenAccount: tokenAccount2.address,
        childrenMeta: _metadata_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user1],
    });
    console.log("initTx :", initTx);
    let childrenMeta = await program.account.childrenMetadata.fetch(
      _metadata_pda
    );
    assert.ok(childrenMeta.reversible == false);


    getAccount(connection, _metadata_pda); // account exists
    let extractTx = await program.rpc.burnForToken({
      accounts: {
        currentOwner: user2.publicKey,
        parentTokenMint: tokenAccount2.mint,
        parentTokenAccount: tokenAccount2.address,
        childTokenAccount: tokenAccount1.address,
        childrenMeta: _metadata_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user2],
    });

    let metaDataAfter = await program.account.childrenMetadata.fetchNullable(_metadata_pda);
    assert.ok(metaDataAfter === null);
    
    let tokenAccount1After = await getAccount(connection, tokenAccount1.address);
    assert.ok(tokenAccount1After.owner.toBase58() === user2.publicKey.toBase58());
       
    let tokenAccount2After = await getAccount(connection, tokenAccount2.address);
    assert.ok(tokenAccount2After.amount.toString() == "0");
  });

  /**
   * Test: transfer NFT from user 1 to NFT 2
   * check NFT owner now becomes PDA
   */
  it("Inject NFT", async () => {
    let connection = anchor.getProvider().connection;
    const [_metadata_pda4, _metadata_bump4] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount4.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda4.toString());
    console.log(_metadata_bump4);
    console.log("DONE");
    assert.ok(tokenAccount3.owner.toBase58() === user1.publicKey.toBase58());
    let initTx = await program.rpc.initializeInject(true, _metadata_bump4, {
      accounts: {
        currentOwner: user1.publicKey,
        childTokenAccount: tokenAccount3.address,
        parentTokenAccount: tokenAccount4.address,
        childrenMeta: _metadata_pda4,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user1],
    });
    console.log("initTx :", initTx);
    let childrenMeta = await program.account.childrenMetadata.fetch(
      _metadata_pda4
    );
    assert.ok(childrenMeta.reversible == true);
    console.log("before setAuthority ", tokenAccount3.owner.toString());
    assert.ok(childrenMeta.bump == _metadata_bump4);
    tokenAccount3 = await getAccount(connection, tokenAccount3.address);
    assert.ok(tokenAccount3.owner.equals(_metadata_pda4));
  });

  /**
   * Test: transfer NFT from NFT 2 back to user 1
   * check NFT owner now becomes user 1
   */
  it("Extract NFT", async () => {
    console.log("Extracting");
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount4.address.toBuffer(),
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());

    getAccount(connection, _metadata_pda); // account exists
    let extractTx = await program.rpc.extract(_metadata_bump, {
      accounts: {
        currentOwner: user2.publicKey,
        childTokenAccount: tokenAccount3.address,
        parentTokenAccount: tokenAccount4.address,
        childrenMeta: _metadata_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [user2],
    });
    console.log("extractTx :", extractTx);
    try {
      getAccount(connection, _metadata_pda);
    } catch (error: any) {
      assert.ok(error.message == "TokenAccountNotFoundError");
    }
  });

  it("copy nft", async () => {
    let connection = anchor.getProvider().connection;
    let name = "copy_nft";
    let symbol = "nft_symbol";
    let uri = "https://arweave.net/MwkMActRVmKND2t3Bq1qzrT7PdWtO-ZPVnZxh5SQooA";

    const [_nft_mint_pda, _nft_mint_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("synthetic-nft-mint-seed")),
        mint5.toBuffer(),
      ],
      program.programId
    );
    console.log("_nft_mint_pda:", _nft_mint_pda);

    const [_nft_token_account_pda, _nft_token_account_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(
            anchor.utils.bytes.utf8.encode("synthetic-nft-account-seed")
          ),
          user5.publicKey.toBuffer(),
        ],
        program.programId
      );

    const metadataProgramId = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
    const [_nft_metadata_pda, _nft_metadata_bump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from(anchor.utils.bytes.utf8.encode("metadata")),
          new PublicKey(metadataProgramId).toBuffer(),
          _nft_mint_pda.toBuffer(),
        ],
        new PublicKey(metadataProgramId)
      );
    console.log("_nft_metadata_pda: ", _nft_metadata_pda);
      
    let nftCopyTx = await program.rpc.nftCopy(name, symbol, uri, {
      accounts: {
        currentOwner: user3.publicKey,
        fromNftMint: mint5,
        nftMetaDataAccount: _nft_metadata_pda,
        nftMintAccount: _nft_mint_pda,
        nftTokenAccount: _nft_token_account_pda,

        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        mplProgram: MPL_PROGRAM_ID,
      },
      signers: [user5],
    });
    console.log("nftCopyTx: ", nftCopyTx);

    // validate _nft_token_account_pda
    let nftTokenAccount = await getAccount(connection, _nft_token_account_pda);
    assert.ok(nftTokenAccount.mint.toString() == _nft_mint_pda.toString());

    let nftMetadata = await getNFTMetadata(
      _nft_mint_pda.toBase58(),
      connection,
      _nft_metadata_pda.toBase58()
    );
    console.log("nftMetadata: ", nftMetadata);
  });
});
