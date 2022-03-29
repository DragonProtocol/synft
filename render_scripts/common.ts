import * as anchor from "@project-serum/anchor";
import { Synft } from "./synft";
const PublicKey = anchor.web3.PublicKey;

function initSynftProgram() {
  const idl = require("./idl.json");
  const web3 = anchor.web3;
  const Keypair = anchor.web3.Keypair;
  const keypairId =
    "[125,80,6,196,91,20,194,252,89,75,162,187,65,171,144,51,78,30,111,57,16,210,215,237,249,62,74,70,114,65,243,219,32,151,221,17,102,219,199,185,61,37,45,203,89,189,58,81,92,110,55,99,13,91,180,110,213,80,138,102,156,39,81,244]";
  const wallet = new anchor.Wallet(
    Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairId)))
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

export async function findChildrenMetaPda(parent_mint, child_mint, program) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("children-of")),
      parent_mint.toBuffer(),
      child_mint.toBuffer(),
    ],
    program.programId
  );
}

export async function findParentMetaPda(mint, program) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("parent-metadata-seed")),
      mint.toBuffer(),
    ],
    program.programId
  );
}

export async function findCrankMetaPda(mint, program) {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("crank-seed")),
      mint.toBuffer(),
    ],
    program.programId
  );
}

export const SynftProgram = initSynftProgram();
