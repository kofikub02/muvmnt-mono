import { appConfig } from "../app-config";

export const QUEUE_NAMES = {
    PUSH: 'push-notifications',
    EMAIL: 'email-notifications',
    SMS: 'sms-notifications',
    WHATSAPP: 'whatsapp-notifications'
} as const;

const REDIS_QUEUE_CONFIG = {
    host: appConfig.REDIS_URI,
    port: appConfig.REDIS_PORT,
    password: appConfig.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
}

export const DEFAULT_QUEUE_CONFIG = {
    connection: REDIS_QUEUE_CONFIG,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
};