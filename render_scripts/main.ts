import { doBurnCrank } from "./burn_crank";
import { doTransferCrank } from "./transfer_crank";

let fileExist = function (file) {
    const fs = require("fs");
    return fs.existsSync(file);
}
  
function sleep(s) {
return new Promise(resolve => setTimeout(resolve, s*1000));
}
  
async function main() {
    console.log("start cranking......");
    
    for(;;) {
      while(fileExist("stop")) { console.log("stopping..."); await sleep(3); }
  
      process.stdout.write(".");
      await sleep(3);
  
      try {
        await doTransferCrank();
      } catch(e) { console.log("doTransferCrank failed:", e); }

      try {
        await doBurnCrank();
      } catch(e) { console.log("doBurnCrank failed:", e); }
    }
}
  
main();
  