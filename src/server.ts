import express, {Application} from "express";
import * as swagger from "swagger-ui-express";
import {readFileSync} from "fs";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import * as dotenv from "dotenv";
import {Config} from "./common/config";
import {UserRequestsRoute} from "./routes/UserRequestsRoute";
import {GameRoute} from "./routes/GameRoute";
import {CronJobs} from "./cronJobs";
import {GameStatus, gameStatusListener, GameStatusNode, getGameStatusName} from "./services/GameStatusListener";
import {GameService} from "./services/GameService";

dotenv.config();

class Server {
    public app: Application;
    private userRequestsRouter: UserRequestsRoute;
    private gameRouter: GameRoute;
    private gameService: GameService;

    constructor() {
        this.app = express();
        this.userRequestsRouter = new UserRequestsRoute();
        this.gameRouter = new GameRoute();
        this.gameService = new GameService();

        this.config();
        this.routes();
        this.configSwagger();
        this.setupGameStatusListener();
    }

    public config(): void {
        this.app.set("port", process.env.PORT || 8000);
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(compression());
        this.app.use(cors());
        this.app.set("trust proxy", 2);

        const myStream = {
            write: (text: any) => {
                console.log(text);
            },
        };
        this.app.use(morgan(":remote-addr :method :url :status :response-time ms - :res[content-length]", {stream: myStream}));
    }

    public routes(): void {
        this.app.get("/ping", async (req, res) => {
            res.send("Hello World!");
        });
        this.app.use("/user-requests", this.userRequestsRouter.router);
        this.app.use("/game", this.gameRouter.router);
    }

    private configSwagger(): void {
        const docs = JSON.parse(readFileSync("swagger/swagger.json", "utf-8"));
        this.app.use("/api-docs", swagger.serve, swagger.setup(docs));
    }

    private setupGameStatusListener(): void {
        // Set up custom handlers for game status changes
        gameStatusListener.onGameStatusChange = (gameStatuses) => {
            gameStatuses.forEach(gameStatus => {
                const statusName = getGameStatusName(gameStatus.status as GameStatus);

                console.log(`[GameStatusListener] Game ${gameStatus.game_id} status: ${statusName} (${gameStatus.status})`);
                console.log(`[GameStatusListener] Players: P1=${gameStatus.p1}, P2=${gameStatus.p2}, Winner=${gameStatus.winner}`);

                this.handleGameStatusChange(gameStatus.game_id, gameStatus.status as GameStatus, gameStatus);
            });
        };

        // Set up handler for new game creation
        gameStatusListener.onGameCreated = (gameStatus) => {
            console.log(`[GameStatusListener] New game creation triggered for game ${gameStatus.game_id}`);
            this.handleGameCreation(gameStatus);
        };

        gameStatusListener.onError = (error) => {
            console.error('[GameStatusListener] Error:', error.message);
        };

        // Start the listener
        gameStatusListener.start();
        console.log('[Server] GameStatusListener configured and started');
    }

    private handleGameStatusChange(gameId: number, status: GameStatus, gameData: GameStatusNode): void {
        switch (status) {
            case GameStatus.CREATED:
                console.log(`Game ${gameId} has been created`);
                this.handleGameCreated(gameData);
                break;
            case GameStatus.PLAYER_JOINED:
                console.log(`Game ${gameId} has a player joined`);
                this.handlePlayerJoined(gameData);
                break;
            case GameStatus.FINISHED:
                console.log(`Game ${gameId} has finished`);
                this.handleGameFinished(gameData);
                break;
        }
    }

    private async handleGameCreation(gameData: GameStatusNode): Promise<void> {
        try {
            // TODO: Implement database insertion logic here
            console.log(`[GameLogic] Creating new game in database:`, {
                gameId: gameData.game_id,
                status: gameData.status,
                p1: gameData.p1,
                p2: gameData.p2,
                winner: gameData.winner
            });

        
            await this.gameService.registerGame({
                idGame: gameData.game_id,
                host: gameData.p1,
                isFinished: false,
                Description: "Chess game with player",
                totalFund: 100,
            });
            

            console.log(`[GameLogic] Successfully created game ${gameData.game_id} in database`);
        } catch (error) {
            console.error(`[GameLogic] Failed to create game ${gameData.game_id} in database:`, error);
        }
    }

    private async handleGameCreated(gameData: GameStatusNode): Promise<void> {
        console.log(`[GameLogic] Processing game creation for game ${gameData.game_id}`);

    }

    private handlePlayerJoined(gameData: GameStatusNode): void {
        console.log(`[GameLogic] Processing player join for game ${gameData.game_id}`);
    }

    private async handleGameFinished(gameData: GameStatusNode): Promise<void> {
        console.log(`[GameLogic] Processing game finish for game ${gameData.game_id}`);
        const game =  await this.gameService.getGameInfo(gameData.game_id.toString())
        await this.gameService.updateGame({
            idGame: gameData.game_id,
            winner: gameData.winner,
            isFinished: true,
            ...game
        })

        console.log(`[GameLogic] Game id: ${gameData.game_id} Winner: ${gameData.winner}`);
    }

    public start(): void {
        this.app.listen(this.app.get("port"), () => {
            console.log(`API is running at ${Config.API_SCHEMES}://${Config.HOST}:${Config.PORT}/api-docs`);

            // Check status after a short delay to allow connection to establish
            setTimeout(() => {
                console.log(`[Server] GameStatusListener status: ${gameStatusListener.getConnectionStatus()}`);
            }, 1000);
        });
    }

    public stop(): void {
        // Graceful shutdown
        gameStatusListener.stop();
        console.log('[Server] Server stopped gracefully');
    }
}

async function startServer(): Promise<void> {
    const server = new Server();

    // Graceful shutdown handlers
    process.on('SIGINT', () => {
        console.log('\n[Server] Received SIGINT. Graceful shutdown...');
        server.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n[Server] Received SIGTERM. Graceful shutdown...');
        server.stop();
        process.exit(0);
    });

    CronJobs.start();
    server.start();
}

startServer();
