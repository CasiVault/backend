// index.ts
import cron from "node-cron";
import { TulipAgent } from "./agent";
import { CompoundV3Service } from "./services/CompoundV3Service";
import { AaveV3Service } from "./services/AaveV3Service";
import dotenv from "dotenv";
import { checkBalance, provider_strk, checkEvent } from "./contracts";
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
  checkEvent(75555);
});

checkBalanceJob.start();
