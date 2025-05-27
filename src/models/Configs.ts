import mongoose, { Schema } from "mongoose";
import { FaceitDB } from "../common/connections/MongoDB";

export interface IConfigs {
    _id: string;
    metadata: any;
}

const Configs = new mongoose.Schema<IConfigs>({
    _id: {
        type: String,
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
});

export default FaceitDB.model<IConfigs>("Configs", Configs, "configs");
