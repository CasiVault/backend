import { WithdrawRequestService } from "../services/WithdrawRequestService";
import Configs from "../models/Configs";
import { getRangeIndex, getRequestWithdraw } from "../contracts";
import { IWithdrawRequest } from "../models/WithdrawRequest";
export class CrawlWithdrawRequest {
    private withdrawRequestService: WithdrawRequestService;
    private crawlId: string;

    constructor() {
        this.withdrawRequestService = new WithdrawRequestService();
        this.crawlId = "withdraw_request_crawl";
    }

    private formatWithdrawRequest(index: number, withdrawRequest: any): IWithdrawRequest {
        return {
            _id: index,
            sender: withdrawRequest[0],
            recipient: withdrawRequest[1],
            amount: withdrawRequest[2].toString(),
            status: "PENDING",
        };
    }

    private async crawlWithdrawRequest(lastCrawledIndex: number): Promise<[IWithdrawRequest[], string]> {
        const withdrawRequests: IWithdrawRequest[] = [];

        const lastWithdrawRequestIndex = (await getRangeIndex())[1] - 1n;
        console.log("Last withdraw request index: ", lastWithdrawRequestIndex);

        if (lastCrawledIndex > lastWithdrawRequestIndex) {
            console.log("Last crawled index is greater than last withdraw request index");
            return [withdrawRequests, lastWithdrawRequestIndex.toString()];
        }

        for (let index = lastCrawledIndex; index <= lastWithdrawRequestIndex; index++) {
            const withdrawRequest = await getRequestWithdraw(index);
            withdrawRequests.push(this.formatWithdrawRequest(index, withdrawRequest));
        }

        return [withdrawRequests, lastWithdrawRequestIndex.toString()];
    }

    public async run() {
        console.log("Crawling withdraw requests");
        const lastCrawledData = (await Configs.findOne({ _id: this.crawlId })) ?? { metadata: null };

        let lastCrawledIndex = lastCrawledData.metadata;
        if (lastCrawledIndex == null) {
            lastCrawledIndex = 0;
        } else {
            lastCrawledIndex = parseInt(lastCrawledIndex);
            lastCrawledIndex++;
        }

        const [pendingWithdrawRequests, lastWithdrawRequestIndex] = await this.crawlWithdrawRequest(lastCrawledIndex);

        console.log("Pending withdraw requests: ", JSON.stringify(pendingWithdrawRequests, null, 2));

        await this.withdrawRequestService.upsertWithdrawRequest(pendingWithdrawRequests as any);

        await Configs.updateOne({ _id: this.crawlId }, { $set: { metadata: lastWithdrawRequestIndex } }, { upsert: true });
        console.log("Updated last crawled index: ", lastWithdrawRequestIndex);
    }
}
