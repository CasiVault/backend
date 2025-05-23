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

  async getStakedBalance(): Promise<number> {
    let balance = await compoundV3ModuleContract.getTotalValue();
    return balance;
  }

  async deposit(): Promise<string> {
    let balanceUSDCInTreasury = await this.getTreasuryBalance();

    if (balanceUSDCInTreasury > 0) {
      console.log("Deposit to CompoundV3 with amount: ", balanceUSDCInTreasury);
      const unsignedTx = await compoundV3ModuleContract.interface.encodeFunctionData("deposit", ["0x"]);
      let finalTx = await treasuryContract.approveAndCallModule(compoundV3ModuleContract.getAddress(), balanceUSDCInTreasury, 0, unsignedTx);

      console.log("Transaction transfer to CompoundV3 submitted: ", finalTx.hash);
      await finalTx.wait();
      console.log("Transaction transfer to CompoundV3 confirmed");
      return finalTx.hash;
    } else {
      console.log("No balance to deposit to CompoundV3.");
      return "";
    }
  }

  async withdraw(): Promise<string> {
    let balanceUSDCInCompoundV3 = await this.getStakedBalance();
    if (balanceUSDCInCompoundV3 > 0) {
      console.log("Withdrawing from CompoundV3 with amount: ", balanceUSDCInCompoundV3);

      const unsignedWithdrawTx = await compoundV3ModuleContract.interface.encodeFunctionData("withdraw", ["0x"]);

      let finalTx = await treasuryContract.callModule(compoundV3ModuleContract.getAddress(), 0, unsignedWithdrawTx);

      console.log("Transaction withdraw from CompoundV3 submitted: ", finalTx.hash);
      await finalTx.wait();
      console.log("Transaction withdraw from CompoundV3 confirmed");
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
