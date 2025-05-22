import cron from "node-cron";
import { TulipAgent } from "./agent";
import { CompoundV3Service } from "./services/CompoundV3Service";
import { AaveV3Service } from "./services/AaveV3Service";
import dotenv from "dotenv";

dotenv.config();

const agent = new TulipAgent();
const protocols = [
  new CompoundV3Service(),
  new AaveV3Service(),
];

cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Running TulipAgent processing...");
    await agent.processing(protocols);
    console.log("✅ Processing completed.\n");
  } catch (err) {
    console.error("❌ Error in cron:", err);
  }
});
