import GameInfo, { IGameInfo } from "../models/GameInfo";
import getLogger from "../utils/LoggerUtils";
import { removeUndefinedFields } from "../utils/DataUtils";
import { BadRequest } from "../common/errors/BadRequest";
import { getTotalFund } from "../contracts";
import { ServerError } from "../common/errors/ServerError";

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
            const [data, total] = await Promise.all([
                GameInfo.find({ host: { $exists: true } })
                    .skip(skip)
                    .limit(limit),
                GameInfo.countDocuments({ host: { $exists: true } }),
            ]);

            logger.info(`Fetched games with pagination: skip=${skip}, limit=${limit}`);
            return { data, total };
        } catch (error) {
            logger.error(`Error getting all games: ${error}`);
            throw error;
        }
    }

    public async fundGame(idGame: string, amount: string) {
        try {
            logger.info(`Funding game with id: ${idGame} and amount: ${amount}`);

            const game = await GameInfo.findOne({ idGame: idGame });
            if (!game) {
                throw new BadRequest("Game not found");
            }

            let newFund = await getTotalFund(Number(idGame));
            if (newFund == null || isNaN(Number(newFund))) {
                throw new ServerError("Failed to fetch total fund");
            }
            
            game.totalFund = newFund.toString();
            logger.info(`Game total fund after funding: ${game.totalFund}`);

            await game.save();
            return game;
        } catch (error) {
            logger.error(`Error funding game: ${error}`);
            throw error;
        }
    }
}
