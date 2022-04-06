import * as anchor from "@project-serum/anchor";
import { Synft } from "./synft";
const PublicKey = anchor.web3.PublicKey;
const keypairId = "[164,193,9,56,119,8,179,156,94,71,134,1,75,219,170,145,133,201,114,39,215,183,27,44,61,145,109,183,97,253,53,150,11,179,26,201,28,169,135,22,234,21,156,137,48,211,227,222,66,154,93,125,201,246,46,149,237,100,139,65,182,32,141,101]";
export const UserKeypair = anchor.web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairId)))
function initSynftProgram() {
  const idl = require("./idl.json");
  const web3 = anchor.web3;
  const wallet = new anchor.Wallet(
    UserKeypair
  );
  const rpcDevUrl = "https://api.devnet.solana.com";
  const rpcLocalUrl = "http://localhost:8899";
  const rpcUrl = rpcDevUrl;
  //const rpcUrl = rpcLocalUrl;
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
