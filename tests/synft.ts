import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram, Transaction, Connection, Commitment } from '@solana/web3.js';

import { TOKEN_PROGRAM_ID, createMint, mintTo, getAccount,Account, setAuthority,AuthorityType,
   getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import { Synft } from "../target/types/synft";
import { assert, expect } from "chai";
import { token } from "@project-serum/anchor/dist/cjs/utils";

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
  const mintAuthority = anchor.web3.Keypair.generate();
  const payer = anchor.web3.Keypair.generate();
  let mint1 = null;
  let mint2 = null; 
  let tokenAccount1 = null as Account;
  let tokenAccount2 = null as Account;


  it("Is initialized!", async () => {
    let connection = anchor.getProvider().connection;
    await anchor.getProvider().connection.confirmTransaction(
      await anchor.getProvider().connection.requestAirdrop(payer.publicKey, 1000000000),
      "processed"
    );
    await anchor.getProvider().connection.confirmTransaction(
      await anchor.getProvider().connection.requestAirdrop(user1.publicKey, 1000000000),
      "processed"
    );
    await anchor.getProvider().connection.confirmTransaction(
      await anchor.getProvider().connection.requestAirdrop(user2.publicKey, 1000000000),
      "processed"
    );
    await anchor.getProvider().connection.confirmTransaction(
      await anchor.getProvider().connection.requestAirdrop(mintAuthority.publicKey, 1000000000),
      "processed"
    );

    let payerAmount = await anchor.getProvider().connection.getBalance(payer.publicKey);
    assert.ok(payerAmount == 1000000000);

    mint1 = await createMint(anchor.getProvider().connection, 
              payer, mintAuthority.publicKey, mintAuthority.publicKey, 0);
    mint2 = await createMint(anchor.getProvider().connection, 
              payer, mintAuthority.publicKey, mintAuthority.publicKey, 0);
    tokenAccount1 = await getOrCreateAssociatedTokenAccount(connection, payer,
      mint1, user1.publicKey, true);
    tokenAccount2 = await getOrCreateAssociatedTokenAccount(connection, payer,
      mint2, user2.publicKey, true);     
    assert.ok(tokenAccount1.owner.toString() == user1.publicKey.toString());
    assert.ok(tokenAccount2.owner.toString() == user2.publicKey.toString());
    let signature1 = await mintTo(
                connection,
                payer,
                mint1,
                tokenAccount1.address,
                mintAuthority,
                1,
                []
            );
    console.log('mint tx 1 :', signature1);        
    let signature2 = await mintTo(
              connection,
              payer,
              mint2,
              tokenAccount2.address,
              mintAuthority,
              1,
              []
          );
    console.log('mint tx 2 :', signature2);
  });

  /**
   * Test: transfer spl token from user 1 to NFT
   * 
  */
  it("Inject fungible token", async () => {
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer()      
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());
    console.log("_metadata_bump is",_metadata_bump);

    const inject_fungible_token_amount = 1;
    const [_fungible_token_pda, _fungible_token_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("spl-token-seed")),
        tokenAccount2.address.toBuffer()      
      ],
      program.programId
    );
    console.log("_fungible_token_pda is ", _fungible_token_pda.toString());
    console.log("_fungible_token_bump is",_fungible_token_bump);

    let initTx = await program.rpc.initializeFungibleTokenInject( 
      true, _metadata_bump, inject_fungible_token_amount,
      {
        accounts: {
          currentOwner: user1.publicKey,
          childTokenAccount: tokenAccount1.address,
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
    console.log('initTx :', initTx);
    console.log('_fungible_token_pda :', _fungible_token_pda);
    let childrenMeta = await program.account.childrenMetadata.fetch(_metadata_pda);
    assert.ok(childrenMeta.reversible == true);
    assert.ok(childrenMeta.bump == _metadata_bump);
    const splTokenAccount = await getAccount(connection, _fungible_token_pda);
    assert.ok(splTokenAccount.owner.equals(_metadata_pda)); 
  });

  /**
   * Test: transfer NFT from user 1 to NFT 2
   * check NFT owner now becomes PDA
  */
  it("Inject", async () => {
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer()      
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());
    console.log(_metadata_bump);
    console.log("DONE")
    let initTx = await program.rpc.initializeInject( 
      true, _metadata_bump,
      {
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
      }
    );
    console.log('initTx :', initTx);
    let childrenMeta = await program.account.childrenMetadata.fetch(_metadata_pda);
    assert.ok(childrenMeta.reversible == true);
    console.log("before setAuthority ", tokenAccount1.owner.toString());
    assert.ok(childrenMeta.bump == _metadata_bump);
    tokenAccount1 = await getAccount(connection, tokenAccount1.address);
    assert.ok(tokenAccount1.owner.equals(_metadata_pda)); 
  });

  /**
   * Test: transfer NFT from NFT 2 back to user 1
   * check NFT owner now becomes user 1
  */
  it("Extract", async ()=> {
    console.log("Extracting");
    let connection = anchor.getProvider().connection;
    const [_metadata_pda, _metadata_bump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
        tokenAccount2.address.toBuffer()      
      ],
      program.programId
    );
    console.log("_metadata_pda is ", _metadata_pda.toString());
    getAccount(connection, _metadata_pda); // account exists
    let extractTx = await program.rpc.extract(
      _metadata_bump,
      {
        accounts: {
          currentOwner: user2.publicKey,
          childTokenAccount: tokenAccount1.address,
          parentTokenAccount: tokenAccount2.address,
          childrenMeta: _metadata_pda,
     
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user2],
      }
    );
    console.log('extractTx :', extractTx);
    try {
      getAccount(connection, _metadata_pda);
    } catch (error: any) {
      assert.ok(error.message == "TokenAccountNotFoundError");
    }
  });
});
