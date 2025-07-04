import dotenv from 'dotenv';
dotenv.config();

import { Server as HttpServer } from 'node:http';
import app from './express-app';

import { 
    appConfig, firebaseOptions, mailerOptions, redisConnectionOptions, 
    smsTwilioOptions, whatsappTwilioOptions 
} from './app-config';
import { NotificationQueueManager } from './queues/manager';
import { IdempotencyRepository } from './repository/idempotency.repository';
import { startRedis } from '@repo/lib';
import logger from './lib/logger';
import { connectMongoDB } from '@repo/lib';
import { startApp } from './express-app';
import { UserNotificationDataRepository } from './repository/user-data.repository';
import { SendNotificationConsumer } from './consumers/consume-send-notification';
import { KafkaClient, KafkaConsumer } from '@repo/lib';

startApp(app);

const httpServer: HttpServer = new HttpServer(app);

/**
 * 
 * @returns 
 */
async function startQueueManager() {
    const manager = new NotificationQueueManager({
        push: firebaseOptions,
        email: mailerOptions,
        sms: smsTwilioOptions,
        // whatsapp: whatsappTwilioOptions
    });
    
    await manager.initialize();
    return manager;
}

/**
 * 
 * @param notificationQueueManager 
 * @param idempotencyService 
 * @returns 
 */
async function startKafka(
    notificationQueueManager: NotificationQueueManager,
    idempotencyService: IdempotencyRepository
) { 
    const consumer = new KafkaConsumer(`${appConfig.APP_ID}-consumer`);

    const notificationUserDataRepository = new UserNotificationDataRepository()

    await consumer.subscribe(
        new SendNotificationConsumer(
            notificationQueueManager, 
            idempotencyService, 
            notificationUserDataRepository
        )
    );

    await consumer.consumeMessages();

    return consumer;
}


/**
 * 
 */
async function startServer() {
    await connectMongoDB(appConfig.MONGODB_URI);

    const redis = startRedis(redisConnectionOptions);

    const idempotencyService = new IdempotencyRepository(redis);

    const queueManager = await startQueueManager();

    KafkaClient.getInstance().initialize(appConfig.APP_ID, appConfig.KAFKA_BROKERS);

    httpServer.listen(appConfig.API_PORT, '0.0.0.0',  () => {
        logger.info(`${appConfig.APP_ID}: listening on port:${appConfig.API_PORT} at process: ${process.pid}`);
    });

    const kafkaConsumer = await startKafka(queueManager, idempotencyService);

    const idempotencyCleanupTimer = setInterval(() => {
        idempotencyService.cleanup().catch(console.error);
    }, 60 * 60 * 1000); 

    const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;
    signals.forEach((signal) => {
        process.on(signal, async () => {
            await kafkaConsumer.destroy();
            await queueManager.closeAll();
            await redis.quit();
            clearInterval(idempotencyCleanupTimer)
            process.exit(0);
        });
    });
}

startServer().catch(logger.error);