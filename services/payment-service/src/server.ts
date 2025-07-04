import dotenv from 'dotenv';
dotenv.config();

import { appConfig } from './app-config';
import { Server as HttpServer } from 'node:http';
import app from './express-app';
import logger from './lib/logger';
import { startApp } from './express-app';
import { KafkaClient, KafkaConsumer, connectMongoDB } from '@repo/lib';
import { ProcessPaymentConsumer } from './consumers/consume-process-payment';

process.on("uncaughtException", async (err) => {
    logger.error(`uncaughtException: ${err}`);
    process.exit(1);
});

const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;
signals.forEach((signal) => {
    process.on(signal, async () => {
        process.exit(0);
    });
});

async function startKafka() { 
    const consumer = new KafkaConsumer(`${appConfig.APP_ID}-consumer`);

    await consumer.subscribe(
        new ProcessPaymentConsumer()
    );

    await consumer.consumeMessages();

    return consumer;
}

startApp(app);

const httpServer: HttpServer = new HttpServer(app);

async function startServer() {
    await connectMongoDB(appConfig.MONGODB_URI);

    KafkaClient.getInstance().initialize(appConfig.APP_ID, appConfig.KAFKA_BROKERS);
    
    httpServer.listen(appConfig.API_PORT, '0.0.0.0',  () => {
        logger.info(`Listening on port:${appConfig.API_PORT} at process: ${process.pid}`);
    });

    const kafkaConsumer = await startKafka();

    const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;
    signals.forEach((signal) => {
        process.on(signal, async () => {
            await kafkaConsumer.destroy();
            process.exit(0);
        });
    });
}

startServer().catch(logger.error);