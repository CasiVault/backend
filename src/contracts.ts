import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Account, RpcProvider, json, Contract, ec, constants, num, hash, LegacyContractClass, Abi } from 'starknet';
const fs = require('fs');
dotenv.config();

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);


const maxQtyGasAuthorized = 180000n;
const maxPriceAuthorizeForOneGas = 10n ** 15n;
const provider_strk = new RpcProvider({
  nodeUrl: process.env.STRK_RPC_URL,
});

const accountAddress = process.env.ACCOUNT_ADDRESS || "";
const privateKey = process.env.PRIVATE_KEY_STRK || "";

export const account = new Account(provider_strk, accountAddress, privateKey, undefined, constants.TRANSACTION_VERSION.V3);

const erc20_address = '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d';

export async function getERC20Contract(): Promise<any> {
  const testAbi = await provider_strk.getClassAt(erc20_address);
  if (testAbi === undefined ||  !('abi' in testAbi)) {
    throw new Error('no abi.');
  }

  const erc20 = new Contract(testAbi.abi, erc20_address, provider_strk);
  erc20.connect(account);
  return erc20;
}



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
