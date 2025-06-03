import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { Account, RpcProvider, json, Contract, ec, constants, num, hash, LegacyContractClass, Abi, CallData, cairo, uint256 } from "starknet";
const fs = require("fs");
dotenv.config();

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
export const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const maxQtyGasAuthorized = 180000n;
const maxPriceAuthorizeForOneGas = 10n ** 15n;
export const provider_strk = new RpcProvider({
    nodeUrl: process.env.STRK_RPC_URL,
});

const accountAddress = process.env.ACCOUNT_ADDRESS || "";
const privateKey = process.env.PRIVATE_KEY_STRK || "";

export const account = new Account(provider_strk, accountAddress, privateKey, undefined, constants.TRANSACTION_VERSION.V3);

const erc20_address = process.env.TOKEN_STRK || "";

const tulip_address = process.env.TULIP_CONTRACT || "";

const faceit_address = process.env.FACEIT_CONTRACT || "";

// export async function checkEvent(block_number: number): Promise<any> {
//     const lastBlock = await provider_strk.getBlock("latest");
//     const keyFilter = [[num.toHex(hash.starknetKeccak("DepositHandled"))]];
//     const eventsList = await provider_strk.getEvents({
//         address: "0x0594c1582459ea03f77deaf9eb7e3917d6994a03c13405ba42867f83d85f085d",
//         from_block: { block_number: block_number },
//         to_block: { block_number: lastBlock.block_number },
//         keys: keyFilter,
//         chunk_size: 10,
//     });
//     console.log(eventsList);
//     for (const event of eventsList.events) {
//         console.log("--- Event ---");
//         console.log("From Address:", event.from_address);
//         console.log("Keys:", event.keys);
//         console.log("Data:", event.data);
//         if (event.keys[2] == process.env.ACCOUNT_ADDRESS) {
//             console.log("Success");
//         }
//         break;
//     }
// }

async function getFaceitContract(): Promise<Contract> {
    const faceitAbi = await provider_strk.getClassAt(faceit_address);
    if (faceitAbi === undefined || !("abi" in faceitAbi)) {
        throw new Error("no abi.");
    }

    const faceit = new Contract(faceitAbi.abi, faceit_address, provider_strk);
    faceit.connect(account);
    return faceit;
}

async function getTotalFund(id: Number): Promise<any> {
    const faceit = await getFaceitContract();
    let fund = await faceit.getTotalFundEachCompetition(id);
    console.log("Fund: ", fund);
}

getTotalFund(785696);

async function register(id: Number): Promise<any> {
    const faceit = await getFaceitContract();
    const myCall1 = faceit.populate("register", [id]);
    const { transaction_hash: txH } = await account.execute(myCall1, {
        version: constants.TRANSACTION_VERSION.V3,
        maxFee: 1e15,
        tip: 1e13,
        paymasterData: [],
        resourceBounds: {
            l1_gas: {
                max_amount: num.toHex(maxQtyGasAuthorized),
                max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
            },
            l2_gas: {
                max_amount: num.toHex(0),
                max_price_per_unit: num.toHex(0),
            },
        },
    });
    console.log("tx: ", txH);
    const txR = await provider_strk.waitForTransaction(txH);
    if (txR.isSuccess()) {
        console.log("Paid fee =", txR.actual_fee);
        console.log("events: ", txR.events);
    }

}

//register(10);


async function raiseFund(amount: number, gameId: number): Promise<any> {
    // const erc20 = await getERC20Contract();
    // const faceit = await getFaceitContract();
    const amountUint256 = uint256.bnToUint256(BigInt(amount));
    const gameIdUint256 = uint256.bnToUint256(BigInt(gameId));
    const multiCall = await account.execute([
        {
          contractAddress:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient:
              faceit_address,
            amount: amountUint256,
          }),
        },
        {
          contractAddress:
            faceit_address,
          entrypoint: "raiseFund",
          calldata: CallData.compile({
            gameId: gameIdUint256,
            amountToken: amountUint256,
          }),
        },
      ]);
      await provider_strk.waitForTransaction(multiCall.transaction_hash);
}





async function transfer(amount: Number): Promise<any> {
    const erc20 = await getERC20Contract();
    const vault = await getVaultContract();
    const myCall1 = erc20.populate("transfer", [faceit_address, amount]);
    const { transaction_hash: txH } = await account.execute(myCall1, {
        version: constants.TRANSACTION_VERSION.V3,
        maxFee: 1e15,
        tip: 1e13,
        paymasterData: [],
        resourceBounds: {
            l1_gas: {
                max_amount: num.toHex(maxQtyGasAuthorized),
                max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
            },
            l2_gas: {
                max_amount: num.toHex(0),
                max_price_per_unit: num.toHex(0),
            },
        },
    });
    console.log("tx: ", txH);
    const txR = await provider_strk.waitForTransaction(txH);
    if (txR.isSuccess()) {
        console.log("Paid fee =", txR.actual_fee);
        console.log("events: ", txR.events);
    }
}

async function updateRate(): Promise<any> {
    const vault = await getVaultContract();
    
}

async function getERC20Contract(): Promise<Contract> {
    const testAbi = await provider_strk.getClassAt(erc20_address);
    if (testAbi === undefined || !("abi" in testAbi)) {
        throw new Error("no abi.");
    }

    const erc20 = new Contract(testAbi.abi, erc20_address, provider_strk);
    erc20.connect(account);
    return erc20;
}

export async function checkBalance(user: String): Promise<any> {
    const tokenStrk = await getERC20Contract();
    const tx = await tokenStrk.balance_of(user);
    console.log(tx);
    return tx;
}

checkBalance("0x05f0f718e8ae8356b800001104e840ba2384e413f5b1567b55dc457c044a75d9");

export async function getBalance(user: String): Promise<any> {
    const vault = await getVaultContract();
    const balance = await vault.getBalance(user);
    console.log("Balance: ", balance);
}

getBalance("0x00d5944409b0e99d8671207c1a1f8db223a258f2effa29efdf2cbddf0a85d1b1");

export async function getVaultContract(): Promise<Contract> {
    const vault_address = tulip_address;
    const { abi: vaultAbi } = await provider_strk.getClassAt(vault_address);
    const vault = new Contract(vaultAbi, vault_address, provider_strk);
    vault.connect(account);
    return vault;
}

export async function approveVault(amount: Number) {
    const erc20 = await getERC20Contract();
    const vault = await getVaultContract();
    const myCall1 = erc20.populate("approve", [tulip_address, amount]);
    const { transaction_hash: txH } = await account.execute(myCall1, {
        version: constants.TRANSACTION_VERSION.V3,
        maxFee: 1e15,
        tip: 1e13,
        paymasterData: [],
        resourceBounds: {
            l1_gas: {
                max_amount: num.toHex(maxQtyGasAuthorized),
                max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
            },
            l2_gas: {
                max_amount: num.toHex(0),
                max_price_per_unit: num.toHex(0),
            },
        },
    });
    console.log("tx: ", txH);
    const txR = await provider_strk.waitForTransaction(txH);
    if (txR.isSuccess()) {
        console.log("Paid fee =", txR.actual_fee);
        console.log("events: ", txR.events);
    }
    //const txReceipt = await provider_strk.getTransactionReceipt("0x5fddbd9214389991c02426ecfc7bb3e223918fef4bc182449f2a79f2c28eff8");
    // if (!txReceipt.isSuccess()) return;
    // console.log("Finality status:", txReceipt.finality_status);
    // console.log("events: ", txReceipt.events);

    // if (txReceipt.execution_status === "SUCCEEDED") {
    //     for (const event of txReceipt.events) {
    //         console.log("--- Event ---");
    //         console.log("From Address:", event.from_address);
    //         console.log("Keys:", event.keys);
    //         console.log("Data:", event.data);
    //     }
    // }
}

//approveVault(10);

export async function deposit(amount: Number) {
    const vault = await getVaultContract();
    const myCall2 = vault.populate("deposit", [amount]);

    const tx2 = await account.execute(myCall2, {
        version: constants.TRANSACTION_VERSION.V3,
        maxFee: 1e15,
        tip: 1e13,
        paymasterData: [],
        resourceBounds: {
            l1_gas: {
                max_amount: num.toHex(maxQtyGasAuthorized),
                max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
            },
            l2_gas: {
                max_amount: num.toHex(0),
                max_price_per_unit: num.toHex(0),
            },
        },
    });
    console.log("Transfer tx hash:", tx2.transaction_hash);
    const txR = await provider_strk.waitForTransaction(tx2.transaction_hash);
    if (txR.isSuccess()) {
        
    }
}

//deposit(10);

export async function transferToTreasury(amount: Number) {
    const vault = await getVaultContract();
    const myCall3 = vault.populate("transferToTreasury", [
        amount,
        "0xb1CF4E0a37138660D0760944229E474c8A7DBC21",
        "0x0594c1582459ea03f77deaf9eb7e3917d6994a03c13405ba42867f83d85f085d",
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    ]);

    const tx3 = await account.execute(myCall3, {
        version: constants.TRANSACTION_VERSION.V3,
        maxFee: 1e15,
        tip: 1e13,
        paymasterData: [],
        resourceBounds: {
            l1_gas: {
                max_amount: num.toHex(maxQtyGasAuthorized),
                max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
            },
            l2_gas: {
                max_amount: num.toHex(0),
                max_price_per_unit: num.toHex(0),
            },
        },
    });
    console.log("Transfer tx hash:", tx3.transaction_hash);
    const txR = await provider_strk.waitForTransaction(tx3.transaction_hash);
    if (txR.isSuccess()) {
        console.log("Paid fee =", txR.actual_fee);
        console.log("events: ", txR.events);
    }
}

export async function getTotalWithdraw() {
    const vault = await getVaultContract();
    const totalWithdraw = await vault.getTotalWithdraw();
    return totalWithdraw;
}

export async function requestWithdraw(amount: Number, recipient: string) {
    const vault = await getVaultContract();
    const myCall4 = vault.populate("requestWithdraw", [amount, recipient]);

    const tx4 = await account.execute(myCall4, {
        version: constants.TRANSACTION_VERSION.V3,
        maxFee: 1e15,
        tip: 1e13,
        paymasterData: [],
        resourceBounds: {
            l1_gas: {
                max_amount: num.toHex(maxQtyGasAuthorized),
                max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
            },
            l2_gas: {
                max_amount: num.toHex(0),
                max_price_per_unit: num.toHex(0),
            },
        },
    });
    console.log("Transfer tx hash:", tx4.transaction_hash);
    const txR = await provider_strk.waitForTransaction(tx4.transaction_hash);
    if (txR.isSuccess()) {
        console.log("Paid fee =", txR.actual_fee);
        console.log("events: ", txR.events);
    }
}

//requestWithdraw(10, "0x00d5944409b0e99d8671207c1a1f8db223a258f2effa29efdf2cbddf0a85d1b1");

export async function getRangeIndex(): Promise<[any, any]> {
    const vault = await getVaultContract();
    let range = await vault.getRangeIndex();
    console.log(range);
    return [range[0], range[1]];
}

function toStarknetAddress(bigint: bigint): string {
    return "0x" + bigint.toString(16);
}

export async function getRequestWithdraw(index: Number) {
    const vault = await getVaultContract();
    let req = await vault.getRequestWithdraw(index);
    return [toStarknetAddress(req[0]), toStarknetAddress(req[1]), req[2]];
}

export async function withdraw(sender: String, amountLP: Number, recipient: String) {
    const vault = await getVaultContract();
    const myCall5 = vault.populate("withdraw", [sender, amountLP, recipient]);
    const tx5 = await account.execute(myCall5, {
        version: constants.TRANSACTION_VERSION.V3,
        maxFee: 1e15,
        tip: 1e13,
        paymasterData: [],
        resourceBounds: {
            l1_gas: {
                max_amount: num.toHex(maxQtyGasAuthorized),
                max_price_per_unit: num.toHex(maxPriceAuthorizeForOneGas),
            },
            l2_gas: {
                max_amount: num.toHex(0),
                max_price_per_unit: num.toHex(0),
            },
        },
    });
    console.log("Transfer tx hash:", tx5.transaction_hash);
    const txR = await provider_strk.waitForTransaction(tx5.transaction_hash);
    if (txR.isSuccess()) {
        console.log("Paid fee =", txR.actual_fee);
        console.log("events: ", txR.events);
    }
}

import compoundV3ModuleABI from "./abi/CompoundV3Module.json";
import aaveV3ModuleABI from "./abi/AAVEModule.json";
import sepoliaTreasuryABI from "./abi/SepoliaTreasury.json";
import erc20ABI from "./abi/ERC20.json";

export const compoundV3ModuleContract = new ethers.Contract(process.env.COMPOUND_V3_MODULE_ADDRESS!, compoundV3ModuleABI, wallet);

export const aaveV3ModuleContract = new ethers.Contract(process.env.AAVE_V3_MODULE_ADDRESS!, aaveV3ModuleABI, wallet);

export const tokenContract = new ethers.Contract(process.env.TOKEN_ADDRESS!, erc20ABI, wallet);

export const treasuryContract = new ethers.Contract(process.env.TREASURY_ADDRESS!, sepoliaTreasuryABI, wallet);
