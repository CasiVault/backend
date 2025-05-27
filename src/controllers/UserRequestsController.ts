import { Request, Response } from "express";
import { WithdrawRequestService } from "../services/WithdrawRequestService";
import { sendRes } from "../common/responses";
import { BadRequest } from "../common/errors/BadRequest";
import { ServerError } from "../common/errors/ServerError";

export class UserRequestsController {
    private withdrawRequestService: WithdrawRequestService;

    constructor() {
        this.withdrawRequestService = new WithdrawRequestService();
        this.getWithdrawRequestBySender = this.getWithdrawRequestBySender.bind(this);
    }

    public async getWithdrawRequestBySender(req: Request, res: Response) {
        const { sender } = req.query;

        if (!sender || typeof sender !== "string") {
            const error = new BadRequest("Sender is required and must be a string");
            sendRes(res, error, null);
            return;
        }
        console.log(sender);
        try {
            const response = await this.withdrawRequestService.getWithdrawRequestBySender(sender);
            sendRes(res, null, response);
        } catch (error) {
            console.log("Error: ", error);
            const serverError = new ServerError("Failed to get withdraw request by sender");
            sendRes(res, serverError, null);
        }
    }
}
