import cron from "node-cron";
import { TulipAgent } from "./agent";
import { CompoundV3Service } from "./services/CompoundV3Service";
import { AaveV3Service } from "./services/AaveV3Service";
import dotenv from "dotenv";
import { checkBalance, provider_strk,  } from "./contracts";
import { Account, RpcProvider, json, Contract, ec, constants, num, hash, LegacyContractClass, Abi, provider } from "starknet";

dotenv.config();

const agent = new TulipAgent();
const protocols = [new CompoundV3Service(), new AaveV3Service()];

export const checkBalanceJob = cron.schedule("*/1 * * * *", async () => {
    try {
        console.log("⏰ Running TulipAgent processing...");
        await agent.processing(protocols);
        console.log("✅ Processing completed.\n");
    } catch (err) {
        console.error("❌ Error in cron:", err);
    }
});

// export const checkBalanceJob = cron.schedule("*/0.1 * * * *", async () => {
//     console.log(await agent.getWithdrawAmountForUserRequest());
//     await agent.withdrawProcessForUserRequest();
// });

checkBalanceJob.start();
