import * as anchor from "@project-serum/anchor";
import {
  createMint,
  getMinimumBalanceForRentExemptMint,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token2";
import {
  createMintAndMintToAssociatedTokenBuilder,
  createCreateMetadataAccountV2InstructionWithSigners,
  createCreateMasterEditionV3InstructionWithSigners,
  findAssociatedTokenAccountPda,
  findMetadataPda,
  keypairIdentity,
  Metaplex,
  TransactionBuilder,
  findMasterEditionV2Pda,
} from "@metaplex-foundation/js";
import { createSetAndVerifyCollectionInstruction } from "mpl-token-metadata2";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  Connection,
  LAMPORTS_PER_SOL,
  SendTransactionError,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { Synft } from "../target/types/synft";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("snowball nft", () => {
  const SnowballMftMetadataSeed = "snowball-nft-metadata";
  const SnowballNftUniqueSeed = "snowball-nft-unique";

  const InjectSolSeed = "sol-seed";
  const InjectParentMetadataSeed = "parent-metadata-seed";
  const InjectRootOwnerSeed = "root-owner-seed";

  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Synft as anchor.Program<Synft>;
  const connection = anchor.getProvider().connection;

  const payer = anchor.web3.Keypair.generate();
  const wallet = new anchor.Wallet(payer);

  const commitment: anchor.web3.Commitment = "processed";

  const metaplex = new Metaplex(connection).use(keypairIdentity(payer));

  const nftMint = anchor.web3.Keypair.generate();
  const collectionMint = anchor.web3.Keypair.generate();
  const injectAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
  const initAmount = 10 * anchor.web3.LAMPORTS_PER_SOL;

  let snowballAccount;

  before(async () => {
    await connection.confirmTransaction(
      await connection.requestAirdrop(payer.publicKey, initAmount),
      commitment
    );
    await createNft("My NFT", nftMint, payer, connection, metaplex);
    await createNft(
      "Collection NFT",
      collectionMint,
      payer,
      connection,
      metaplex
    );
  });

  before("set collection for nft", async () => {
    const nftMetadata = findMetadataPda(nftMint.publicKey);
    const collectionMetadata = findMetadataPda(collectionMint.publicKey);
    const collectionMasterEdition = findMasterEditionV2Pda(
      collectionMint.publicKey
    );
    const tx = new Transaction();
    tx.add(
      createSetAndVerifyCollectionInstruction({
        metadata: nftMetadata,
        collectionAuthority: payer.publicKey,
        payer: payer.publicKey,
        updateAuthority: payer.publicKey,
        collectionMint: collectionMint.publicKey,
        collection: collectionMetadata,
        collectionMasterEditionAccount: collectionMasterEdition,
        // collectionAuthorityRecord?: web3.PublicKey;
      })
    );

    await metaplex.rpc().sendAndConfirmTransaction(tx);

    const nft = await metaplex.nfts().findByMint(nftMint.publicKey);

    expect(nft.name).to.be.equal("My NFT");
    expect(
      nft.metadataAccount.data.collection.key.equals(collectionMint.publicKey)
    ).to.be.ok;
  });

  it("initialize", async () => {
    const [_pdaAccount, _bump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(SnowballMftMetadataSeed),
        collectionMint.publicKey.toBuffer(),
      ],
      program.programId
    );
    snowballAccount = _pdaAccount;
    await program.methods
      .initSnowballNft()
      .accounts({
        snowballNftMetadata: snowballAccount,
        collectionMint: collectionMint.publicKey,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .rpc();
    const pdaAccountData = await program.account.snowballNftMetadata.fetch(
      snowballAccount
    );

    expect(pdaAccountData.size.toNumber()).to.equal(0);
    expect(pdaAccountData.collectionMint.equals(collectionMint.publicKey)).to
      .ok;
    getSnowballSol();
  });

  it("update collection size", async () => {
    const associatedToken = findAssociatedTokenAccountPda(
      nftMint.publicKey,
      payer.publicKey
    );
    const nftMetadata = findMetadataPda(nftMint.publicKey);
    const [snowballNftUnique] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(SnowballNftUniqueSeed), nftMint.publicKey.toBuffer()],
      program.programId
    );
    const [snowballAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(SnowballMftMetadataSeed),
        collectionMint.publicKey.toBuffer(),
      ],
      program.programId
    );
    await uniqueUpdate();

    const pdaAccountData = await program.account.snowballNftMetadata.fetch(
      snowballAccount
    );

    expect(pdaAccountData.size.toNumber()).to.equal(1);
    expect(pdaAccountData.collectionMint.equals(collectionMint.publicKey)).to
      .ok;

    await expect(uniqueUpdate()).to.rejectedWith(SendTransactionError);

    async function uniqueUpdate() {
      await program.methods
        .updateSnowballNft()
        .accounts({
          snowballNftUnique: snowballNftUnique,
          snowballNftMetadata: snowballAccount,
          nftMint: nftMint.publicKey,
          collectionMint: collectionMint.publicKey,
          nftMetadata: nftMetadata,
          nftTokenAccount: associatedToken,
          payer: payer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc();
    }
  });

  it("transfer sol to snowball-nft for simulate sell fee", async () => {
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: snowballAccount,
        lamports: 1 * LAMPORTS_PER_SOL,
      })
    );
    await metaplex.rpc().sendAndConfirmTransaction(tx);
    getSnowballSol();
    const userSol = await getUserSol();
    expect(userSol * LAMPORTS_PER_SOL + LAMPORTS_PER_SOL < initAmount).to.be.ok;
  });

  it("inject sol", async () => {
    const [injectSolPDA, solBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(InjectSolSeed), nftMint.publicKey.toBuffer()],
        program.programId
      );
    const nftAssociatedToken = findAssociatedTokenAccountPda(
      nftMint.publicKey,
      payer.publicKey
    );
    await program.methods
      .injectToSol(solBump, injectAmount)
      .accounts({
        currentOwner: payer.publicKey,
        parentMintAccount: nftMint.publicKey,
        parentTokenAccount: nftAssociatedToken,
        solAccount: injectSolPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .rpc();
    const injectSolPdaAccountInfo = await connection.getAccountInfo(
      injectSolPDA
    );
    expect(injectSolPdaAccountInfo.lamports > LAMPORTS_PER_SOL).to.be.ok;
  });

  it("burn nft with extract snowball-nft sol", async () => {
    const [snowballNftMetadataAccount] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(SnowballMftMetadataSeed),
          collectionMint.publicKey.toBuffer(),
        ],
        program.programId
      );
    const [snowballNftUniqueAccount] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(SnowballNftUniqueSeed), nftMint.publicKey.toBuffer()],
        program.programId
      );
    const nftMetadata = findMetadataPda(nftMint.publicKey);
    const associatedToken = findAssociatedTokenAccountPda(
      nftMint.publicKey,
      payer.publicKey
    );

    const [injectSolPDA, _solBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(InjectSolSeed), nftMint.publicKey.toBuffer()],
        program.programId
      );
    const [injectParentPDA, _parentBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(InjectParentMetadataSeed), nftMint.publicKey.toBuffer()],
        program.programId
      );
    const [injectOldRootOwner] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(InjectRootOwnerSeed), nftMint.publicKey.toBuffer()],
      program.programId
    );

    let snowballUniqueAccountInfo = await connection.getAccountInfo(
      snowballNftUniqueAccount
    );
    const uniqueSol = snowballUniqueAccountInfo.lamports / LAMPORTS_PER_SOL;
    expect(uniqueSol > 0).to.be.ok;

    const beforeUserSol = await getUserSol();

    await program.methods
      .extractSnowballNftSolWithNftBurn()
      .accounts({
        snowballNftMetadata: snowballNftMetadataAccount,
        snowballNftUnique: snowballNftUniqueAccount,
        nftMint: nftMint.publicKey,
        nftTokenAccount: associatedToken,
        nftMetadata,
        collectionMint: collectionMint.publicKey,
        injectSolAccount: injectSolPDA,
        injectOldRootOwner: injectOldRootOwner,
        injectParentMetadata: injectParentPDA,
        owner: payer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .rpc();

    snowballUniqueAccountInfo = await connection.getAccountInfo(
      snowballNftUniqueAccount
    );
    expect(snowballUniqueAccountInfo).to.be.null;

    const injectSolPdaAccountInfo = await connection.getAccountInfo(
      injectSolPDA
    );
    expect(injectSolPdaAccountInfo).to.be.null;

    const injectParentPDAInfo = await connection.getAccountInfo(
      injectParentPDA
    );
    expect(injectParentPDAInfo).to.be.null;

    // TODO fix! ata should be close after burn
    // const ata = await connection.getAccountInfo(associatedToken);
    // expect(ata).to.be.null;

    const finalUserSol = await getUserSol();
    expect(
      finalUserSol * LAMPORTS_PER_SOL >=
        uniqueSol * LAMPORTS_PER_SOL +
          beforeUserSol * LAMPORTS_PER_SOL +
          1 * LAMPORTS_PER_SOL
    ).to.be.ok;
  });

  async function getUserSol() {
    const payerAccountInfo = await connection.getAccountInfo(payer.publicKey);
    const payerSol = payerAccountInfo.lamports / anchor.web3.LAMPORTS_PER_SOL;
    return payerSol;
  }

  async function getSnowballSol() {
    const pdaAccountInfo = await connection.getAccountInfo(snowballAccount);
    const pdaSol = pdaAccountInfo.lamports / anchor.web3.LAMPORTS_PER_SOL;
    return pdaSol;
  }
});

async function createNft(
  name: string,
  mint: anchor.web3.Signer,
  payer: anchor.web3.Signer,
  connection: Connection,
  metaplex: Metaplex
) {
  const associatedToken = findAssociatedTokenAccountPda(
    mint.publicKey,
    payer.publicKey
  );
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const masterEdition = findMasterEditionV2Pda(mint.publicKey);
  const metadata = findMetadataPda(mint.publicKey);

  const data = {
    name,
    symbol: "",
    sellerFeeBasisPoints: 10,
    uri: "",
    creators: [
      {
        address: metaplex.identity().publicKey,
        share: 100,
        verified: false,
      },
    ],
    collection: null,
    uses: null,
  };

  const tx = TransactionBuilder.make()
    .add(
      createMintAndMintToAssociatedTokenBuilder({
        lamports,
        decimals: 0,
        amount: 1,
        createAssociatedToken: true,
        mint,
        payer,
        mintAuthority: metaplex.identity(),
        owner: metaplex.identity().publicKey,
        associatedToken,
      })
    )
    .add(
      createCreateMetadataAccountV2InstructionWithSigners({
        data,
        isMutable: false,
        mintAuthority: metaplex.identity(),
        payer: payer,
        mint: mint.publicKey,
        metadata,
        updateAuthority: metaplex.identity().publicKey,
      })
    )
    .add(
      createCreateMasterEditionV3InstructionWithSigners({
        maxSupply: 0,
        payer,
        mintAuthority: metaplex.identity(),
        updateAuthority: metaplex.identity(),
        mint: mint.publicKey,
        metadata,
        masterEdition: masterEdition,
      })
    );

  await metaplex.rpc().sendAndConfirmTransaction(tx);

  // Then the transaction succeeded and the NFT was created.
  // const nft = await metaplex.nfts().findByMint(mint.publicKey);
  // // console.log(nft.metadataAccount);
  // expect(nft.name).to.be.equal("Collection NFT");
}
