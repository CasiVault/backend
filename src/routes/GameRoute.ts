import { Router } from "express";
import { GameController } from "../controllers/GameController";

export class GameRoute {
    public router: Router;
    private gameController = new GameController();

    constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.post("/register", this.gameController.registerGame);
        this.router.get("/get-info", this.gameController.getGameInfo);
        this.router.put("/update", this.gameController.updateGame);
        this.router.delete("/delete", this.gameController.deleteGame);
        this.router.get("/all", this.gameController.getAllGames);
    }
}
