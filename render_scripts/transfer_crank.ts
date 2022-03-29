import { PublicKey } from "@solana/web3.js";
import { SynftProgram, findParentMetaPda, findChildrenMetaPda, findCrankMetaPda } from "./common";

async function main() {

  let pdas = await fetchAllchildrenMetadataV2PDAs(SynftProgram);
  pdas.forEach(element => {
    if (element.account.isMutated) {
      console.log(element.account.isMutated.toString());
    }
  })
  // 1.有孩子的
  //   a. 有两层， 需要执行init、process、end

  // 2. 没有孩子的 执行init、end
  //   a. root指向自己的，说明是前两层
  //   b. root不指向自己，说明是后两层
}

async function fetchAllchildrenMetadataV2PDAs(program) {
  // const filter: any = [];
  // filter.push({
  //   memcmp: {
  //     offset: 22, //need to prepend 34 bytes for ChildrenMetadataV2 is_mutated
  //     bytes: "r3ye1XJ",
  //   },
  // });
  const pdas = await program.account.childrenMetadataV2.all();
  return pdas;
}
main();

