import { WithdrawRequestService } from "../services/WithdrawRequestService";

export class CrawlWithdrawRequest {
    private withdrawRequestService: WithdrawRequestService;

    constructor() {
        this.withdrawRequestService = new WithdrawRequestService();
    }

    private async crawlWithdrawRequest() {
        const withdrawRequests: any[] = [];
        //TODO: Call the function from contract to get the withdraw requests
        return withdrawRequests;
    }

    public async run() {
        const pendingWithdrawRequests = await this.crawlWithdrawRequest();
        // await this.withdrawRequestService.upsertWithdrawRequest(pendingWithdrawRequests);
    }
}