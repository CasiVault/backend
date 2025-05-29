import mongoose from "mongoose";
import { FaceitDB } from "../common/connections/MongoDB";

export interface IWithdrawRequest {
    _id: number;
    sender: string;
    recipient: string;
    amount: string;
    status: string;
}

const WithdrawRequest = new mongoose.Schema<IWithdrawRequest>(
    {
        _id: {
            type: Number,
            required: true,
        },
        sender: {
            type: String,
            required: true,
        },
        recipient: {
            type: String,
            required: true,
        },
        amount: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
    {
        versionKey: false,
    }
);

export default FaceitDB.model<IWithdrawRequest>("WithdrawRequest", WithdrawRequest, "withdraw_request");
