import { IProtocolService } from "./IProtocolService";
import { aaveV3ModuleContract, tokenContract, treasuryContract } from "../contracts";
import { ethers } from "ethers";

export class AaveV3Service implements IProtocolService {
  name = "AaveV3";

  async getAPY(): Promise<number> {
    // mock
    return 5;
  }

  async getTreasuryBalance(): Promise<number> {
    let balanceUSDCInTreasury = await tokenContract.balanceOf(treasuryContract.getAddress());
    return balanceUSDCInTreasury;
  }

  async getStakedBalance(): Promise<number> {
    let balance = await aaveV3ModuleContract.getTotalValue();
    return balance;
  }

  async deposit(): Promise<string> {
    let balanceUSDCInTreasury = await this.getTreasuryBalance();
    console.log("Depositing to AaveV3 with amount: ", balanceUSDCInTreasury);

    const unsignedTx = await aaveV3ModuleContract.interface.encodeFunctionData("deposit", ["0x"]);
    let finalTx = await treasuryContract.approveAndCallModule(aaveV3ModuleContract.getAddress(), balanceUSDCInTreasury, 0, unsignedTx);

    console.log("Transaction transfer to AaveV3 submitted: ", finalTx.hash);
    await finalTx.wait();
    console.log("Transaction transfer to AaveV3 confirmed");
    return finalTx.hash
  }

  async withdraw(): Promise<string> {
    let balanceUSDCInAaveV3 = await this.getStakedBalance();
    if (balanceUSDCInAaveV3 > 0) {
      console.log("Withdrawing from AaveV3 with amount: ", balanceUSDCInAaveV3);

      const unsignedWithdrawTx = await aaveV3ModuleContract.interface.encodeFunctionData("withdraw", ["0x"]);

      let finalTx = await treasuryContract.callModule(aaveV3ModuleContract.getAddress(), 0, unsignedWithdrawTx);

      console.log("Transaction withdraw from AaveV3 submitted: ", finalTx.hash);
      await finalTx.wait();
      console.log("Transaction withdraw from AaveV3 confirmed");
      return finalTx.hash;
    } else {
      console.log("No balance to withdraw from CompoundV3.");
      return "";
    }

  }

  async transferAllToProtocol(protocols: IProtocolService[]): Promise<void> {
    // Rút toàn bộ từ các protocol khác về treasury
    for (const protocol of protocols) {
      if (protocol.name !== this.name) {
        await protocol.withdraw();
      }
    }
    // Gửi tiền từ treasury vào protocol hiện tại
    await this.deposit();
  }
}
