import { createLogger, format, transports } from 'winston';

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
        new transports.File({ filename: 'app.log' })
    ]
});

export default logger;