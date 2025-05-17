import { IProtocolService } from "./IProtocolService";
import { aaveV3ModuleContract, tokenContract, treasuryContract } from "../contracts";
import { ethers } from "ethers";

export class AaveV3Service implements IProtocolService {
  name = "AaveV3";

  async getAPY(): Promise<number> {
    // mock
    return 7;
  }

  async getTreasuryBalance(): Promise<number> {
    let balanceUSDCInTreasury = await tokenContract.balanceOf(treasuryContract.getAddress());
    return balanceUSDCInTreasury;
  }

  async deposit(): Promise<string> {
    console.log("Depositing to AaveV3");
    let balanceUSDCInTreasury = await this.getTreasuryBalance();
    console.log("Balance USDC in Treasury before : ", balanceUSDCInTreasury);

    const unsignedTx = await aaveV3ModuleContract.interface.encodeFunctionData("deposit", ["0x"]);
    let finalTx = await treasuryContract.approveAndCallModule(aaveV3ModuleContract.getAddress(), balanceUSDCInTreasury, 0, unsignedTx);

    console.log("Transaction transfer to AaveV3 submitted: ", finalTx.hash);
    await finalTx.wait();
    console.log("Transaction transfer to AaveV3 confirmed");
    return finalTx.hash
  }

  async withdraw(): Promise<string> {
    console.log("Withdrawing from AaveV3");
    const unsignedWithdrawTx = await aaveV3ModuleContract.interface.encodeFunctionData("withdraw", ["0x"]);

    let finalTx = await treasuryContract.callModule(aaveV3ModuleContract.getAddress(), 0, unsignedWithdrawTx);

    console.log("Transaction withdraw from AaveV3 submitted: ", finalTx.hash);
    await finalTx.wait();
    console.log("Transaction withdraw from AaveV3 confirmed");
    return finalTx.hash;
  }
}
