import { WithdrawRequestService } from "../services/WithdrawRequestService";
import getLogger from "../utils/LoggerUtils";

const logger = getLogger("HandlePendingWithdrawRequest");

export class HandlePendingWithdrawRequest {
    private withdrawRequestService: WithdrawRequestService;
    
    constructor() {
        this.withdrawRequestService = new WithdrawRequestService();
    }

    private async handleWithdrawRequest(withdrawRequests: any[]) {
        //TODO: Call the function from contract to send withdraw requests to L1


        //Update the status of the withdraw request to "SENT"
        for (const withdrawRequest of withdrawRequests) {
            withdrawRequest.status = "SENT";
        }
        await this.withdrawRequestService.upsertWithdrawRequest(withdrawRequests);
    }

    public async run(){
        const withdrawRequests = await this.withdrawRequestService.getPendingWithdrawRequests();
        logger.info(`Found ${withdrawRequests.length} pending withdraw requests`);

        await this.handleWithdrawRequest(withdrawRequests);
    }
}
