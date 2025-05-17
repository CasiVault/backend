import { IProtocolService } from "./IProtocolService";
import { compoundV3ModuleContract, tokenContract, treasuryContract } from "../contracts";
import { ethers } from "ethers";

export class CompoundV3Service implements IProtocolService {
  name = "CompoundV3";

  async getAPY(): Promise<number> {
    // mock
    return 6;
  }

  async getTreasuryBalance(): Promise<number> {
    let balanceUSDCInTreasury = await tokenContract.balanceOf(treasuryContract.getAddress());
    return balanceUSDCInTreasury;
  }

  async deposit(): Promise<string> {
    console.log("Depositing to CompoundV3");
    let balanceUSDCInTreasury = await this.getTreasuryBalance();
    console.log("Balance USDC in Treasury before : ", balanceUSDCInTreasury);

    const unsignedTx = await compoundV3ModuleContract.interface.encodeFunctionData("deposit", ["0x"]);
    let finalTx = await treasuryContract.approveAndCallModule(compoundV3ModuleContract.getAddress(), balanceUSDCInTreasury, 0, unsignedTx);

    console.log("Transaction transfer to CompoundV3 submitted: ", finalTx.hash);
    await finalTx.wait();
    console.log("Transaction transfer to CompoundV3 confirmed");
    return finalTx.hash
  }

  async withdraw(): Promise<string> {
    console.log("Withdrawing from CompoundV3");
    const unsignedWithdrawTx = await compoundV3ModuleContract.interface.encodeFunctionData("withdraw", ["0x"]);

    let finalTx = await treasuryContract.callModule(compoundV3ModuleContract.getAddress(), 0, unsignedWithdrawTx);

    console.log("Transaction withdraw from CompoundV3 submitted: ", finalTx.hash);
    await finalTx.wait();
    console.log("Transaction withdraw from CompoundV3 confirmed");
    return finalTx.hash;
  }
}
