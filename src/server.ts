import express, { Application } from "express";
import * as swagger from "swagger-ui-express";
import { readFileSync } from "fs";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import * as dotenv from "dotenv";
import { Config } from "./common/config";
import { UserRequestsRoute } from "./routes/UserRequestsRoute";
import { GameRoute } from "./routes/GameRoute";
import { CronJobs } from "./cronJobs";
import { gameStatusListener, GameStatus, parseGameStatus, getGameStatusName } from "./services/GameStatusListener";
dotenv.config();

class Server {
    public app: Application;
    private userRequestsRouter: UserRequestsRoute;
    private gameRouter: GameRoute;

    constructor() {
        this.app = express();
        this.userRequestsRouter = new UserRequestsRoute();
        this.gameRouter = new GameRoute();

        this.config();
        this.routes();
        this.configSwagger();
        this.setupGameStatusListener();
    }

    public config(): void {
        this.app.set("port", process.env.PORT || 8000);
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(compression());
        this.app.use(cors());
        this.app.set("trust proxy", 2);

        const myStream = {
            write: (text: any) => {
                console.log(text);
            },
        };
        this.app.use(morgan(":remote-addr :method :url :status :response-time ms - :res[content-length]", { stream: myStream }));
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
                const parsedStatus = parseGameStatus(gameStatus.status);
                const statusName = parsedStatus !== null ? getGameStatusName(parsedStatus) : 'Unknown';
                
                console.log(`[GameStatusListener] Game ${gameStatus.game_id} status changed to: ${statusName} (${gameStatus.status})`);
                
                if (parsedStatus !== null) {
                    this.handleGameStatusChange(gameStatus.game_id, parsedStatus);
                } else {
                    console.warn(`[GameStatusListener] Unknown status code: ${gameStatus.status} for game ${gameStatus.game_id}`);
                }
            });
        };

        gameStatusListener.onError = (error) => {
            console.error('[GameStatusListener] Error:', error.message);
        };

        // Test connection first
        // gameStatusListener.testConnection();
        
        // Start the listener
        gameStatusListener.start();
        console.log('[Server] GameStatusListener configured and started');
    }

    private handleGameStatusChange(gameId: string, status: GameStatus): void {
        switch (status) {
            case GameStatus.CREATED:
                console.log(`Game ${gameId} has been created`);
                this.handleGameCreated(gameId);
                break;
            case GameStatus.PLAYER_JOINED:
                console.log(`Game ${gameId} has a player joined`);
                this.handlePlayerJoined(gameId);
                break;
            case GameStatus.FINISHED:
                console.log(`Game ${gameId} has finished`);
                this.handleGameFinished(gameId);
                break;
        }
    }

    private handleGameCreated(gameId: string): void {
        // TODO: Implement game creation logic
        console.log(`[GameLogic] Processing game creation for game ${gameId}`);
    }

    private handlePlayerJoined(gameId: string): void {
        // TODO: Implement player join logic
        console.log(`[GameLogic] Processing player join for game ${gameId}`);
    }

    private handleGameFinished(gameId: string): void {
        // TODO: Implement game finish logic
        console.log(`[GameLogic] Processing game finish for game ${gameId}`);
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
