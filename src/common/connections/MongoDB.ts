import * as mongoose from "mongoose";
import { FaceitDBConfig } from "../config";
import getLogger from "../../utils/LoggerUtils";


const logger = getLogger("MongoDB Connection");

export const FaceitDB = mongoose.createConnection(FaceitDBConfig.CONNECTION_URL, {
    autoCreate: false,
    autoIndex: false,
    dbName: FaceitDBConfig.DATABASE,
    user: FaceitDBConfig.USERNAME,
    pass: FaceitDBConfig.PASSWORD,
});

// Thêm các sự kiện lắng nghe
FaceitDB.on("connected", () => {
    logger.info(`MongoDB connected to ${FaceitDBConfig.DATABASE}`);
});

FaceitDB.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err}`);
});

FaceitDB.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
});
