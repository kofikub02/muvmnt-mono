import cors from "cors";
import express, { Application, json, urlencoded } from 'express';
import { appConfig } from './app-config';
import { errorHandler, notFoundHandler, requestLogger } from "@repo/lib";
import { initializeRoutes } from "./api/routes";
import logger from "./lib/logger";

const app = express();

app.get('/payments/health', (req, res) => {
    res.send(`${appConfig.APP_ID} is healthy`);
});

/**
 * Starts the application with the specified Express application.
 * 
 * @param app - The Express application.
 */
export function startApp(app: Application) {
    app.use(cors({ 
        origin: ['*'],
        credentials: true, 
        methods: ['GET', 'OPTIONS'] 
    }));
    app.use(json({ limit: '200mb'}));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
    app.use(requestLogger(logger));
    initializeRoutes(app);
    app.use(notFoundHandler);
    app.use(errorHandler(logger));
}

export default app;