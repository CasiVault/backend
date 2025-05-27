import WithdrawRequest from "../models/WithdrawRequest";

export class WithdrawRequestService {
    constructor() {
        this.getWithdrawRequestBySender = this.getWithdrawRequestBySender.bind(this);
        this.upsertWithdrawRequest = this.upsertWithdrawRequest.bind(this);
        this.getPendingWithdrawRequests = this.getPendingWithdrawRequests.bind(this);
        this.changeStatus = this.changeStatus.bind(this);
    }
    public async upsertWithdrawRequest(withdrawRequests: any[]) {
        const operations: any[] = [];
        for (const withdrawRequest of withdrawRequests) {
            operations.push({
                updateOne: {
                    filter: { _id: withdrawRequest._id },
                    update: withdrawRequest,
                    upsert: true,
                },
            });
        }
        await WithdrawRequest.bulkWrite(operations);
    }

    public async getPendingWithdrawRequests() {
        const withdrawRequests = await WithdrawRequest.find({ status: "PENDING" });
        return withdrawRequests;
    }

    public async getWithdrawRequestBySender(sender: string) {
        console.log("Getting withdraw request by sender: ", sender);
        const withdrawRequest = await WithdrawRequest.findOne({ sender });
        console.log("Found withdraw request: ", withdrawRequest);
        return withdrawRequest;
    }

    public async changeStatus(start: number, finish: number, status: string) {
        const withdrawRequests = await WithdrawRequest.updateMany({ index: { $gte: start, $lte: finish } }, { $set: { status } });
        return withdrawRequests;
    }
}
