import * as dotenv from "dotenv";

dotenv.config();


export const Config = {
    IS_PRODUCTION: process.env.IS_PRODUCTION === "true",
    HOST: process.env.HOST ?? "localhost",
    PORT: process.env.PORT ?? 8000,
    API_SCHEMES: process.env.API_SCHEMES ?? 'http',
}


export const FaceitDBConfig = {
    CONNECTION_URL: process.env.FACEIT_DB_CONNECTION_URL ?? "mongodb://localhost:27017",
    DATABASE: process.env.FACEIT_DB_DATABASE ?? "faceit_database",
    USERNAME: process.env.FACEIT_DB_USERNAME,
    PASSWORD: process.env.FACEIT_DB_PASSWORD,
}
