/* istanbul ignore file */
import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logger = createLogger({
    level: process.env.ENVIRONMENT === 'development' ? 'debug' : 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        //new transports.File({ filename: 'app.log' })
    ]
});

export default logger;