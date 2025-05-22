import WithdrawRequest from "../models/WithdrawRequest";

export class WithdrawRequestService {
    public async upsertWithdrawRequest(withdrawRequests: any[]) {
        const operations: any[] = [];
        for (const withdrawRequest of withdrawRequests) {
            // withdrawRequest._id = `${withdrawRequest.address}-${now}`;
            // withdrawRequest.timestamp = now;
            // withdrawRequest.status = "pending";

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
        const withdrawRequests = await WithdrawRequest.find({ status: "pending" });
        return withdrawRequests;
    }
}
