
import { NotificationResponse, QueueJobData } from '../entities/notifications';
import { NotificationProvider } from '../providers/base';
import logger from '../lib/logger';

export abstract class NotificationQueue {

    constructor(
        protected readonly queueName: string,
        protected readonly concurrency: number = 1,
        protected provider: NotificationProvider,
    ) {

    }

    async initialize(): Promise<void> {
        await this.provider.initialize();
        logger.info(`${this.queueName} queue has been initialized`);
    }

    async addJob(data: QueueJobData, options: any = {}): Promise<NotificationResponse> {
       try {
            const result = await this.provider!.send(data.payload);

            if (!result.success) {
                throw new Error(result.error || 'Notification failed');
            }

            logger.info(`${this.queueName} messageId: ${data.metadata?.messageId} uid: ${data.metadata?.uid} successful: ${JSON.stringify(result)}`);

            return result;
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

    async close(): Promise<void> {
        
    }
}