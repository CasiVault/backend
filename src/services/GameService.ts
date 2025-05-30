import GameInfo, { IGameInfo } from "../models/GameInfo";
import getLogger from "../utils/LoggerUtils";
import { removeUndefinedFields } from "../utils/DataUtils";
const logger = getLogger("GameService");

export class GameService {
    public async upsertGame(gameData: any) {
        try {
            gameData._id = gameData.idGame;
            const filter = { _id: gameData.idGame };
            const configs = { upsert: true, new: true, setDefaultsOnInsert: true };

            const result = await GameInfo.findOneAndUpdate(filter, { $set: gameData }, configs);
            logger.info(`Upserted game with id: ${gameData.idGame}`);

            return result;
        } catch (error) {
            logger.error(`Error upserting game: ${error}`);
            throw error;
        }
    }

    public async registerGame(gameData: any) {
        try {
            const result = await this.upsertGame(gameData);
            logger.info(`Successfully register game: ${result}`);

            return result;
        } catch (error) {
            logger.error(`Error registering game: ${error}`);
            throw error;
        }
    }

    public async getGameInfo(idGame: string) {
        try {
            const result = await GameInfo.findById(idGame);
            logger.info(`Fetched game info for id: ${idGame}`);

            return result;
        } catch (error) {
            logger.error(`Error getting game info: ${error}`);
            throw error;
        }
    }

    public async updateGame(updateData: any) {
        try {
            const cleanedData = removeUndefinedFields(updateData);

            const result = await this.upsertGame(cleanedData);
            logger.info(`Updated game with id: ${updateData.idGame}`);

            return result;
        } catch (error) {
            logger.error(`Error updating game: ${error}`);
            throw error;
        }
    }

    public async deleteGame(idGame: string) {
        try {
            const result = await GameInfo.findByIdAndDelete(idGame);
            logger.info(`Deleted game with id: ${idGame}`);

            return result;
        } catch (error) {
            logger.error(`Error deleting game: ${error}`);
            throw error;
        }
    }

    public async getAllGames(skip = 0, limit = 10) {
        try {
            const [data, total] = await Promise.all([GameInfo.find().skip(skip).limit(limit), GameInfo.countDocuments()]);
            logger.info(`Fetched games with pagination: skip=${skip}, limit=${limit}`);
            return { data, total };
        } catch (error) {
            logger.error(`Error getting all games: ${error}`);
            throw error;
        }
    }
}
