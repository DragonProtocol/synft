import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Synft } from "../target/types/synft";

describe("synft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Synft as Program<Synft>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initializeInject({});
    console.log("Your transaction signature", tx);
  });
});
