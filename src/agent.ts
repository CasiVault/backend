import dotenv from "dotenv";
import { getBestProtocol } from "./services/getBestProtocol";
import { IProtocolService } from "./services/IProtocolService";
import { ethers } from "ethers";
import { treasuryContract } from "./contracts";

dotenv.config();

export class TulipAgent {
    private currentProtocol?: IProtocolService;

    async getTulipCurrentBalance(): Promise<number> {
        // todo: 
        return 100;
    }

    async getTulipTotalBalance(): Promise<number> {
        // todo:
        return 3000;
    }

    async getBalanceInfo() {
        const current = await this.getTulipCurrentBalance();
        const total = await this.getTulipTotalBalance();
        console.log(`Current Balance: ${current}, Total Balance: ${total}`);
    }

    public async calDeposit(): Promise<number> {
        const currentBalance = await this.getTulipCurrentBalance();
        const totalBalance = await this.getTulipTotalBalance();
        let depositAmount = 0;
        if (currentBalance > 0.3 * totalBalance) {
            depositAmount = currentBalance - 0.2 * totalBalance;
        }
        return Math.round(depositAmount * 1e6) / 1e6;
    }

    public async calWithdraw(): Promise<number> {
        const currentBalance = await this.getTulipCurrentBalance();
        const totalBalance = await this.getTulipTotalBalance();
        let withdrawAmount = 0;
        if (currentBalance < 0.1 * totalBalance) {
            withdrawAmount = 0.2 * totalBalance - currentBalance;
        }
        return Math.round(withdrawAmount * 1e6) / 1e6;
    }

    public async transferToTreasury(amount: number): Promise<void> {
        console.log("Transferring from Tulip to Treasury...");
        //todo: hàm chuyển từ tulip sang treasury
    }

    public async transferFromTreasuryToTulip(amount: number): Promise<void> {
        console.log(`Transferring ${amount} from Treasury to Tulip...`);
        const transferTx = await treasuryContract.transferToTulip(amount, {
            value: ethers.parseEther("0.001")
        });
        await transferTx.wait();
        console.log("✅ Đã chuyển từ Treasury về Tulip");
    }

    public async transferFromTulipToBestProtocolFlow(protocols: IProtocolService[]): Promise<string> {
        const tulipCurrentBalance = await this.getTulipCurrentBalance();
        if (tulipCurrentBalance === 0) throw new Error("Tulip balance is 0");
    
        const bestProtocol = await getBestProtocol(protocols);
        this.currentProtocol = bestProtocol;

        const depositAmount = await this.calDeposit();
        if (depositAmount <= 0) {
            console.log("No need to deposit, deposit amount is 0");
            return "Skipped";
        }
    
        await this.transferToTreasury(depositAmount);

        await bestProtocol.deposit();
        return "Deposit complete";
    }
    

    public async withdrawFromBestProtocolToTulipFlow(protocols: IProtocolService[]): Promise<string> {
        //mock current protocol for testing
        this.currentProtocol = protocols[0];
        if (!this.currentProtocol) {
            throw new Error("No protocol has been deposited to before.");
        }
        const withdrawAmount = await this.calWithdraw();
        //const withdrawAmount = 1; //mock withdraw amount for testing

        await this.currentProtocol.withdraw();

        const treasuryBalance = await this.currentProtocol.getTreasuryBalance();
        if (withdrawAmount > treasuryBalance) throw new Error("Withdraw amount > treasury balance");

        await this.transferFromTreasuryToTulip(withdrawAmount);
        const bestProtocol = await getBestProtocol(protocols);
        await bestProtocol.deposit();
        return "Withdraw complete";
    }

    public async checkAndExecuteAction(protocols: IProtocolService[]): Promise<void> {
        try {
            console.log("==> Start check...");
            await this.getBalanceInfo();
            const currentBalance = await this.getTulipCurrentBalance();
            const totalBalance = await this.getTulipTotalBalance();

            if (currentBalance > 0.3 * totalBalance) {
                console.log("Action: Deposit to best protocol");
                await this.transferFromTulipToBestProtocolFlow(protocols);
            } else if (currentBalance < 0.1 * totalBalance) {
                console.log("Action: Withdraw from best protocol");
                await this.withdrawFromBestProtocolToTulipFlow(protocols);
            } else {
                console.log("No action needed.");
            }

            await new Promise(res => setTimeout(res, 20000));
            await this.getBalanceInfo();
            console.log("==> End check.\n");
        } catch (error) {
            console.error("Error during check:", error);
            throw error;
        }
    }
}
