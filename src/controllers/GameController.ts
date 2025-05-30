import { Request, Response } from "express";
import { GameService } from "../services/GameService";
import { sendRes } from "../common/responses";
import { BadRequest } from "../common/errors/BadRequest";
import { ServerError } from "../common/errors/ServerError";

export class GameController {
    private gameService: GameService;

    constructor() {
        this.gameService = new GameService();
        this.registerGame = this.registerGame.bind(this);
        this.getGameInfo = this.getGameInfo.bind(this);
        this.updateGame = this.updateGame.bind(this);
        this.deleteGame = this.deleteGame.bind(this);
        this.getAllGames = this.getAllGames.bind(this);
    }

    public async registerGame(req: Request, res: Response) {
        try {
            const gameData = req.body;
            if (!gameData.idGame || !gameData.host || !gameData.gameName || !gameData.description) {
                return sendRes(res, new BadRequest("Missing required fields"), null);
            }
            const result = await this.gameService.registerGame(gameData);
            sendRes(res, null, result);
        } catch (error) {
            sendRes(res, new ServerError("Failed to register game"), null);
        }
    }

    public async getGameInfo(req: Request, res: Response) {
        try {
            const { idGame } = req.query;
            if (!idGame || typeof idGame !== "string") {
                return sendRes(res, new BadRequest("idGame is required and must be a string"), null);
            }
            const result = await this.gameService.getGameInfo(idGame);
            sendRes(res, null, result);
        } catch (error) {
            sendRes(res, new ServerError("Failed to get game info"), null);
        }
    }

    public async updateGame(req: Request, res: Response) {
        try {
            const updateData = req.body;
            console.log("HAHASKDJAKDJAKJ: ", updateData.idGame);
            if (!updateData.idGame) {
                return sendRes(res, new BadRequest("idGame is required"), null);
            }

            const result = await this.gameService.updateGame(updateData);
            sendRes(res, null, result);
        } catch (error) {
            sendRes(res, new ServerError("Failed to update game"), null);
        }
    }

    public async deleteGame(req: Request, res: Response) {
        try {
            const { idGame } = req.body;
            if (!idGame) {
                return sendRes(res, new BadRequest("idGame is required"), null);
            }
            const result = await this.gameService.deleteGame(idGame);
            sendRes(res, null, result);
        } catch (error) {
            sendRes(res, new ServerError("Failed to delete game"), null);
        }
    }

    public async getAllGames(req: Request, res: Response) {
        try {
            const skip = parseInt((req.query.skip as string) || "0", 10);
            const limit = parseInt((req.query.limit as string) || "10", 10);
            const result = await this.gameService.getAllGames(skip, limit);
            sendRes(res, null, result);
        } catch (error) {
            sendRes(res, new ServerError("Failed to get all games"), null);
        }
    }
}
