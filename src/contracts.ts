import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Account, RpcProvider, json, Contract, ec, constants, num, hash, LegacyContractClass, Abi } from 'starknet';
const fs = require('fs');
dotenv.config();

// export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
// export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);


const maxQtyGasAuthorized = 180000n;
const maxPriceAuthorizeForOneGas = 10n ** 15n;
const provider_strk = new RpcProvider({
  nodeUrl: process.env.STRK_RPC_URL,
});

const accountAddress = process.env.ACCOUNT_ADDRESS || "";
const privateKey = process.env.PRIVATE_KEY_STRK || "";

export const account = new Account(provider_strk, accountAddress, privateKey, undefined, constants.TRANSACTION_VERSION.V3);

const erc20_address = process.env.TOKEN_STRK || "";

async function getERC20Contract(): Promise<Contract> {
  const testAbi = await provider_strk.getClassAt(erc20_address);
  if (testAbi === undefined || !('abi' in testAbi)) {
    throw new Error('no abi.');
  }

  const erc20 = new Contract(testAbi.abi, erc20_address, provider_strk);
  erc20.connect(account);
  return erc20;
}

async function checkBalance(): Promise<any> {
  const tokenStrk = await getERC20Contract();
  const tx = await tokenStrk.balance_of("0x00d5944409b0e99d8671207c1a1f8db223a258f2effa29efdf2cbddf0a85d1b1");
  console.log(tx);
}

const balance = checkBalance();

//1
// const vault_address = "0x06224ff8cd622bb4e960b2dd59f868e4c85bc6d27b6a2ba5cf22366022cb32c4";
// const { abi: vaultAbi } = await provider.getClassAt(vault_address);
// const vault = new Contract(vaultAbi, vault_address, provider);
// vault.connect(account);



//2
// const myCall1 = erc20.populate('approve', [
  //   "0x06224ff8cd622bb4e960b2dd59f868e4c85bc6d27b6a2ba5cf22366022cb32c4",
  //   100
  // ]);
  // const { transaction_hash: txH } = await account.execute(myCall1, {
  //   version: constants.TRANSACTION_VERSION.V3,
  //   maxFee: 1e15,
  //   tip: 1e13,
  //   paymasterData: [],
  //   resourceBounds: {
  //     l1_gas: {
  //       max_amount: num.toHex(maxQtyGasAuthorized),
  //       max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
  //     },
  //     l2_gas: {
  //       max_amount: num.toHex(0),
  //       max_price_per_unit: num.toHex(0),
  //     },
  //   },
  // });
  // console.log("tx: ", txH);
  // const txR = await provider.waitForTransaction(txH);
  // if (txR.isSuccess()) {
  //   console.log('Paid fee =', txR.actual_fee);
  //   console.log("events: ", txR.events);
  // }
  // const txReceipt = await provider.getTransactionReceipt("0x5fddbd9214389991c02426ecfc7bb3e223918fef4bc182449f2a79f2c28eff8");
  // console.log("Finality status:", txReceipt.finality_status);
  // console.log("events: ", txReceipt.events);

  // const txReceipt = await provider.waitForTransaction(tx12.transaction_hash);
  // if (txReceipt.execution_status === 'SUCCEEDED') {
  //   for (const event of txReceipt.events) {
  //     console.log('--- Event ---');
  //     console.log('From Address:', event.from_address);
  //     console.log('Keys:', event.keys);
  //     console.log('Data:', event.data);
  //   }
  // }










//De sau khong can goi
// import compoundV3ModuleABI from "./abi/CompoundV3Module.json";
// import aaveV3ModuleABI from "./abi/AAVEModule.json";
// import sepoliaTreasuryABI from "./abi/SepoliaTreasury.json";
// import erc20ABI from "./abi/ERC20.json";

// export const compoundV3ModuleContract = new ethers.Contract(
//   process.env.COMPOUND_V3_MODULE_ADDRESS!,
//   compoundV3ModuleABI,
//   wallet
// );

// export const aaveV3ModuleContract = new ethers.Contract(
//   process.env.AAVE_V3_MODULE_ADDRESS!,
//   aaveV3ModuleABI,
//   wallet
// );

// export const tokenContract = new ethers.Contract(
//   process.env.TOKEN_ADDRESS!,
//   erc20ABI,
//   wallet
// );

// export const treasuryContract = new ethers.Contract(
//   process.env.TREASURY_ADDRESS!,
//   sepoliaTreasuryABI,
//   wallet
// );
