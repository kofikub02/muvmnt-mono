import Redis from "ioredis";
import logger from "../../../../services/notification-service/src/lib/logger";

let redisConnection: Redis | null = null;

export function startRedis(
    configOptions: { 
        port: number,
        host: string,
        password: string,
    }
): Redis {
    if (redisConnection) {
        logger.info('Connection already in progress, waiting');
        return redisConnection;
    }

    redisConnection = new Redis(configOptions);

    redisConnection.on("connect", () => {
        logger.info('Redis successfully connected');
    })

    redisConnection.on("error", (error) => {
        logger.error("Redis error connecting:", error.message);
    })

    redisConnection.setMaxListeners(0);

    return redisConnection;
}

export function isRedisConnected(): boolean {
    return redisConnection != null;
}