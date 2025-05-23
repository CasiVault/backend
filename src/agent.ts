import dotenv from "dotenv";
import { getBestProtocol } from "./services/getBestProtocol";
import { IProtocolService } from "./services/IProtocolService";
import { ethers } from "ethers";
import { treasuryContract } from "./contracts";

dotenv.config();

export class TulipAgent {
    //TODO: thay bằng hàm tính tổng lượng tiền user request
    async getWithdrawAmountForUserRequest(): Promise<number> {
        return 1;
    }

    //TODO: xử lý luồng rút tiền cho từng user trong hàng đợi
    // gọi đến hàm withdrawForRequest trên contract vault, chuyển tiền cho từng user
    async withdrawProcessForUserRequest(amount: number): Promise<void> {
        return;
    }

    //TODO: check xem balance của vault có > 0 thì chuyển tiền từ vault về treasury
    async transferFromVaultToTreasury(): Promise<void> {
        return;
    }

    public async processing(protocols: IProtocolService[]): Promise<void> {
        try {
            console.log("🔍 Finding best protocol...");
            const bestProtocol = await getBestProtocol(protocols);
            console.log(`Best protocol selected: ${bestProtocol.name}`);

            console.log("Transferring all funds to best protocol...");
            await bestProtocol.transferAllToProtocol(protocols);
            console.log("Transfer complete.");

            const withdrawAmount = await this.getWithdrawAmountForUserRequest();
            console.log(`Calculated withdraw amount: ${withdrawAmount}`);

            if (withdrawAmount > 0) {
                console.log("Withdrawing from best protocol to treasury...");
                await bestProtocol.withdraw();
                console.log("Withdrawal to treasury complete.");

                console.log("Bridging from treasury to vault...");
                let tx = await treasuryContract.transferToTulip(withdrawAmount, {
                    value: ethers.parseEther("0.001"),
                });
                await tx.wait();
                console.log("Bridging complete.");

                console.log("Processing user withdrawal requests in vault...");
                await this.withdrawProcessForUserRequest(withdrawAmount);
                console.log("Vault user withdrawals processed.");
            } else {
                console.log("No withdrawal requests found.");
            }

            console.log("Transferring all funds from vault back to treasury...");
            await this.transferFromVaultToTreasury();
            console.log("Transfer back to treasury complete.");

            console.log("Depositing funds from treasury into best protocol...");
            await bestProtocol.deposit();
            console.log("Deposit to protocol complete.");

            console.log("All steps in processing completed successfully.\n");
        } catch (error) {
            console.error("Error during processing:", error);
        }
    }
}
