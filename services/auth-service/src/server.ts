import dotenv from 'dotenv';
dotenv.config();

import { appConfig } from './app-config';
import { Server as HttpServer } from 'node:http';
import app, { startApp } from './express-app';
import logger from './lib/logger';

process.on("uncaughtException", async (err) => {
    logger.error(`uncaughtException: ${err}`);
    process.exit(1);
});

async function startServer() {
    startApp(app);

    const httpServer: HttpServer = new HttpServer(app);

    httpServer.listen(appConfig.API_PORT, '0.0.0.0',  () => {
        logger.info(`listening on port:${appConfig.API_PORT} - process: ${process.pid}`);
    });

    const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;
    signals.forEach((signal) => {
        process.on(signal, async () => {
            process.exit(0);
        });
    });
}

startServer();