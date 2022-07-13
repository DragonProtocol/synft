import * as anchor from "@project-serum/anchor";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getMinimumBalanceForRentExemptMint } from "@solana/spl-token2";
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
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Synft } from "../target/types/synft";
import { readFile } from "fs/promises";
import path from "path";
import os from "os";

const env = "devnet";
const idl = require("../target/idl/synft.json");

main(path.resolve(os.homedir(), ".config/solana/id.json")).catch(console.error);

async function main(payerPath: string) {
  const connection = new Connection(clusterApiUrl(env));
  const payerFileBuf = await readFile(payerPath, {});
  const payerBuffer = JSON.parse(payerFileBuf.toString());
  const payer = anchor.web3.Keypair.fromSecretKey(Buffer.from(payerBuffer));
  const walletWrapper = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, walletWrapper, {
    preflightCommitment: "recent",
  });
  const synftProgram = new anchor.Program(
    idl as any,
    new PublicKey(idl.metadata.address),
    provider
  ) as anchor.Program<Synft>;
  if (env === "devnet")
    await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
  let payerInfo = await connection.getAccountInfo(payer.publicKey);
  console.log(
    "payerInfo",
    payer.publicKey.toString(),
    payerInfo.lamports / LAMPORTS_PER_SOL
  );
  const metaplex = new Metaplex(connection).use(keypairIdentity(payer));
  const collectionMint = anchor.web3.Keypair.generate();
  await createNft(
    "Collection NFT",
    collectionMint,
    payer,
    connection,
    metaplex
  );

  await initSnowballNFT(synftProgram, collectionMint, payer);
  console.log("CollectionMint", collectionMint.publicKey.toBase58());

  payerInfo = await connection.getAccountInfo(payer.publicKey);
  console.log(
    "payerInfo",
    payer.publicKey.toString(),
    payerInfo.lamports / LAMPORTS_PER_SOL
  );
}

async function initSnowballNFT(
  synftProgram: anchor.Program<Synft>,
  collectionMint: anchor.web3.Keypair,
  walletKeyPair: anchor.web3.Keypair
) {
  const [snowballNftMetadata] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("snowball-nft-metadata"), collectionMint.publicKey.toBuffer()],
    synftProgram.programId
  );
  console.log("snowballNftMetadata", snowballNftMetadata.toBase58());
  await synftProgram.methods
    .initSnowballNft()
    .accounts({
      snowballNftMetadata: snowballNftMetadata,
      collectionMint: collectionMint.publicKey,
      payer: walletKeyPair.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([walletKeyPair])
    .rpc();
}

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
