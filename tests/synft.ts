import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { createMint, mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import { Synft } from "../target/types/synft";
import { assert } from "chai";
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
  let tokenAccount1 = null;
  let tokenAccount2 = null;


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
   * Test: transfer NFT from user 1 to NFT 2
   * check NFT owner now becomes PDA
  */
  it("Inject", async () => {

  });

  /**
   * Test: transfer NFT from NFT 2 back to user 1
   * check NFT owner now becomes user 1
  */
  it("Extract", async ()=> {

  });
});
