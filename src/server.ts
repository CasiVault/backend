import express, { Application } from "express";
import * as swagger from "swagger-ui-express";
import { readFileSync } from "fs";
import compression from "compression";
import morgan from "morgan";
import cors from "cors";
import * as dotenv from "dotenv";
import { Config } from "./common/config";
import { UserRequestsRoute } from "./routes/UserRequestsRoute";
dotenv.config();

class Server {
    public app: Application;
    private userRequestsRouter: UserRequestsRoute;

    constructor() {
        this.app = express();
        this.userRequestsRouter = new UserRequestsRoute();

        this.config();
        this.routes();
        this.configSwagger();
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
    }

    private configSwagger(): void {
        const docs = JSON.parse(readFileSync("swagger/swagger.json", "utf-8"));
        this.app.use("/api-docs", swagger.serve, swagger.setup(docs));
    }

    public start(): void {
        this.app.listen(this.app.get("port"), () => {
            console.log(`API is running at ${Config.API_SCHEMES}://${Config.HOST}:${Config.PORT}/api-docs`);
        });
    }
}

async function startServer(): Promise<void> {
    const server = new Server();
    server.start();
}

startServer();
