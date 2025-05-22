// index.ts
import cron from "node-cron";
import { TulipAgent } from "./agent";
import { CompoundV3Service } from "./services/CompoundV3Service";
import { AaveV3Service } from "./services/AaveV3Service";
import dotenv from "dotenv";
import { checkBalance, provider_strk } from "./contracts";
import { Account, RpcProvider, json, Contract, ec, constants, num, hash, LegacyContractClass, Abi, provider } from "starknet";

dotenv.config();

// const agent = new TulipAgent();
// const protocols = [new CompoundV3Service(), new AaveV3Service()];

// cron.schedule("* * * * *", async () => {
//     try {
//         console.log("⏰ Running TulipAgent check...");
//         await agent.checkAndExecuteAction(protocols);
//         console.log("✅ Check completed.\n");
//     } catch (err) {
//         console.error("❌ Error in cron:", err);
//     }
// });

export const checkBalanceJob = cron.schedule("*/0.1 * * * *", async () => {
    const lastBlock = await provider_strk.getBlock('latest');
      const keyFilter = [[num.toHex(hash.starknetKeccak('DepositHandled'))]];
      const eventsList = await provider_strk.getEvents({
        address: "0x0594c1582459ea03f77deaf9eb7e3917d6994a03c13405ba42867f83d85f085d",
        from_block: { block_number: 788437+1 },
        to_block: { block_number: lastBlock.block_number },
        keys: keyFilter,
        chunk_size: 10,
      });
      console.log(eventsList);
    
      // const txReceipt = await provider.waitForTransaction("0x5fddbd9214389991c02426ecfc7bb3e223918fef4bc182449f2a79f2c28eff8");
      // if (txReceipt.execution_status === 'SUCCEEDED') {
        for (const event of eventsList.events) {
          console.log('--- Event ---');
          console.log('From Address:', event.from_address);
          console.log('Keys:', event.keys);
          console.log('Data:', event.data);
          if (event.keys[2] == process.env.ACCOUNT_ADDRESS) {
            console.log("Success");
          }
          break
        // }
      }
});

checkBalanceJob.start();
