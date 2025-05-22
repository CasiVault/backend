import winston from "winston";
import { Config } from "../common/config";


const getLogger = (loggerName: string) => {
    return winston.createLogger({
        level: 'debug',
        levels: winston.config.npm.levels,
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(
                (info) => `${info.timestamp} [${loggerName}] [${info.level}]: ${info.message}`
            ),
        ),

        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
            }),
        ]
    })
}

export default getLogger;