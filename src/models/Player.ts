import mongoose from "mongoose";
import {FaceitDB} from "../common/connections/MongoDB";

export interface IPlayer {
    _id: string;
    address?: string;
    host: string;
    gameId: string;
}

const PlayerSchema = new mongoose.Schema<IPlayer>({
    _id: {type: String, required: true},
    address: {type: String, required: true},
    gameId: {type: String, required: true},
    host: {type: String, required: true},
}, {
    versionKey: false
});

export default FaceitDB.model<IPlayer>("Player", PlayerSchema, "player");
