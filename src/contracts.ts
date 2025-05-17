import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

import compoundV3ModuleABI from "./abi/CompoundV3Module.json";
import aaveV3ModuleABI from "./abi/AAVEModule.json";
import sepoliaTreasuryABI from "./abi/SepoliaTreasury.json";
import erc20ABI from "./abi/ERC20.json";

export const compoundV3ModuleContract = new ethers.Contract(
  process.env.COMPOUND_V3_MODULE_ADDRESS!,
  compoundV3ModuleABI,
  wallet
);

export const aaveV3ModuleContract = new ethers.Contract(
  process.env.AAVE_V3_MODULE_ADDRESS!,
  aaveV3ModuleABI,
  wallet
);

export const tokenContract = new ethers.Contract(
  process.env.TOKEN_ADDRESS!,
  erc20ABI,
  wallet
);

export const treasuryContract = new ethers.Contract(
  process.env.TREASURY_ADDRESS!,
  sepoliaTreasuryABI,
  wallet
);
