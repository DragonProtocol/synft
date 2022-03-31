import * as anchor from "@project-serum/anchor";
import { Synft } from "./synft";
const PublicKey = anchor.web3.PublicKey;
const keypairId = "[176,69,96,224,88,241,226,73,86,103,219,74,50,97,101,66,4,60,196,99,78,197,47,213,139,7,195,202,52,67,92,221,240,130,166,190,8,7,110,100,122,178,250,39,198,141,128,147,72,221,190,55,104,93,127,25,194,49,14,236,211,75,176,55]";
export const UserKeypair = anchor.web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairId)))
function initSynftProgram() {
  const idl = require("./idl.json");
  const web3 = anchor.web3;
  const wallet = new anchor.Wallet(
    UserKeypair
  );
  const rpcDevUrl = "https://api.devnet.solana.com";
  const rpcLocalUrl = "http://localhost:8899";
  // const rpcUrl = rpcDevUrl;
  const rpcUrl = rpcLocalUrl;
  const processed = "processed";
  const connection = new web3.Connection(
    rpcUrl,
    processed
  );
  const provider = new anchor.Provider(connection, wallet, {
    commitment: processed,
    preflightCommitment: processed,
  });
  const synftProgram = new anchor.Program<Synft>(
    idl,
    new PublicKey(idl.metadata.address),
    provider
  );
  return synftProgram;
}

export async function findChildrenMetaPda(parent_mint, child_mint) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
      parent_mint.toBuffer(),
      child_mint.toBuffer(),
    ],
    SynftProgram.programId
  );
}

export async function findParentMetaPda(mint) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
      mint.toBuffer(),
    ],
    SynftProgram.programId
  );
}

export async function findCrankMetaPda(mint) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("crank-seed")),
      mint.toBuffer(),
    ],
    SynftProgram.programId
  );
}

export const SynftProgram = initSynftProgram();
