import mongoose from "mongoose";
import { FaceitDB } from "../common/connections/MongoDB";

export interface IWithdrawRequest {
    _id: string;
    address: string;
    amount: string;
    status: string;
    timestamp: number;
}

const WithdrawRequest = new mongoose.Schema<IWithdrawRequest>({
    _id: {
        type: String,
        required: true,
    },
    address: {
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
    timestamp: {
        type: Number,
        required: true,
    },
});

export default FaceitDB.model<IWithdrawRequest>("WithdrawRequest", WithdrawRequest, "withdraw_request");
