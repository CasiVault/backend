import mongoose from "mongoose";
import { FaceitDB } from "../common/connections/MongoDB";

export interface IGameInfo {
    _id: string;
    idGame: string;
    host: string;
    isFinished: boolean;
    totalFund: string;
    gameName: string;
    Description: string;
    winner: string;
}

const GameInfoSchema = new mongoose.Schema<IGameInfo>({
    _id: { type: String, required: true },
    idGame: { type: String, required: true },
    host: { type: String, required: true },
    isFinished: { type: Boolean, required: true },
    totalFund: { type: String, required: true },
    gameName: { type: String, required: true },
    Description: { type: String, required: true },
    winner: {type: String, default: null },
},{
    versionKey: false
  });

export default FaceitDB.model<IGameInfo>("GameInfo", GameInfoSchema, "game_info");
