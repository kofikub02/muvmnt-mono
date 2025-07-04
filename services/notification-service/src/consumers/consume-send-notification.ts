import logger from "../lib/logger";
import { KafkaTopics } from "../app-config";
import { MessageUser, NotificationMessage } from "./messages";
import { IdempotencyRepository } from "../repository/idempotency.repository";
import { NotificationQueueManager } from "../queues/manager";
import { NotificationUserData } from "../entities/notifications";
import { validateSendNotificationRequest } from "../validations/requests";
import { ValidationError } from "@repo/lib";
import { KafkaMessageProcessor, ProcessorMessageData } from "@repo/lib";
import { UserNotificationDataRepository } from "../repository/user-data.repository";


export class SendNotificationConsumer extends KafkaMessageProcessor {
    constructor(
        private readonly queueManager: NotificationQueueManager,
        private readonly idempotencyService: IdempotencyRepository,
        private readonly userDataRepository: UserNotificationDataRepository,
    ) {
        super(KafkaTopics.SEND_NOTIFICATION);
    }

    validateMessage(message: NotificationMessage) {
        const { error } = validateSendNotificationRequest(message);
        if (error) {
            throw new ValidationError(error.details[0].message);
        }
    }

    async processMessage({ message }: ProcessorMessageData): Promise<void> {
        try {
            const notification: NotificationMessage = message;
      
            // Validate message structure and required fields
            this.validateMessage(notification);

            const { messageId } = notification.metadata;

            // Check if message is already being processed or has been processed
            if (await this.idempotencyService.isProcessing(messageId)) {
                logger.info(`Message ${messageId} is already being processed`);
                return;
            }

            if (await this.idempotencyService.hasBeenProcessed(messageId)) {
                logger.info(`Message ${messageId} has already been processed`);
                return;
            }

            // Determine active channels
            const activeChannels = this.getActiveChannels(notification);
            
            // Start processing and track the message
            const started = await this.idempotencyService.startProcessing(
                messageId,
                activeChannels
            );

            if (!started) {
                logger.info(`Failed to start processing message ${messageId}`);
                return;
            }

            const recipient = await this.processRecipient(notification.user);

            if (!recipient) {
                logger.info(`Failed to process recipient`);
                return;
            }
        
            const { 
                uid, email, 
                phone_number, device_token, whatsapp
            } = recipient;

            await Promise.all(
                activeChannels.map(async (channel) => {
                    try {
                        await this.processChannel(channel, notification, { uid, email, phone_number, device_token, whatsapp });
                        await this.idempotencyService.updateChannelStatus(
                            messageId,
                            channel,
                            'completed'
                        );
                    } catch (error) {
                        await this.idempotencyService.updateChannelStatus(
                            messageId,
                            channel,
                            'failed',
                            error as string
                        );
                        throw error;
                    }
                })
            );
        } catch (error) {
            logger.error('Error processing message:', error);
        }
    }

    private getActiveChannels(notification: NotificationMessage): string[] {
        const channels: string[] = [];
    
        if (notification.channels.email) {
            channels.push('email');
        }
        if (notification.channels.sms) {
            channels.push('sms');
        }
        if (notification.channels.push) {
            channels.push('push');
        }
        if (notification.channels.whatsapp) {
            channels.push('whatsapp');
        }
    
        return channels;
    }

    private async processRecipient(
        user: MessageUser
    ): Promise<any> {
        const { uid } = user;
        let { email, phone_number, device_token } = user;

        if (uid) {
            const userNotificationData = await this.userDataRepository.findOneByAttr({ 'uid': uid });

            if (!userNotificationData) {
                logger.info(`User with id: ${uid} does not exist`);
                return null;
            }

            if (!email) {
                email = userNotificationData.email;
            }
            if (!phone_number) {
                phone_number = userNotificationData.phone_number;
            }
            if(!device_token) {
                device_token = userNotificationData.device_token;
            }

            return { uid, device_token, email, phone_number };
        }
    }

    private async processChannel(
        channel: string,
        notification: NotificationMessage,
        userData: NotificationUserData
    ): Promise<void> {
        switch (channel) {
            case 'email':
                await this.processEmailNotification(notification, userData);
                break;
            case 'sms':
                await this.processSMSNotification(notification, userData);
                break;
            case 'push':
                await this.processPushNotification(notification, userData);
                break;
            case 'whatsapp':
                await this.processWhatsappNotification(notification, userData);
        }
    }

    private async processEmailNotification(notification: NotificationMessage, userData: NotificationUserData): Promise<void> {
        if (notification.channels.email && userData.email) {
            await this.queueManager.addNotification('email', {
                payload: {
                    to: userData.email,
                    title: notification.channels.email.title,
                    body: notification.channels.email.body
                },
                metadata: {
                    messageId: notification.metadata.messageId,
                    uid: notification.user.uid,
                    priority: notification.metadata.priority,
                    timestamp: Date.now()
                }
            })
        }
    }

    private async processSMSNotification(notification: NotificationMessage, userData: NotificationUserData): Promise<void> {
        if (notification.channels.sms && userData.phone_number) {
            await this.queueManager.addNotification('sms', {
                payload: {
                    to: userData.phone_number,
                    body: notification.channels.sms.title + notification.channels.sms.body
                },
                metadata: {
                    messageId: notification.metadata.messageId,
                    uid: notification.user.uid,
                    priority: notification.metadata.priority,
                    timestamp: Date.now()
                }
            })
        }
    }

    private async processPushNotification(notification: NotificationMessage, userData: NotificationUserData): Promise<void> {
        if (notification.channels.push && userData.device_token) {
            await this.queueManager.addNotification('push', {
                payload: {
                    to: userData.device_token,
                    title: notification.channels.push.title,
                    body: notification.channels.push.body,
                    data: notification.channels.push.data
                },
                metadata: {
                    messageId: notification.metadata.messageId,
                    uid: notification.user.uid,
                    priority: notification.metadata.priority,
                    timestamp: Date.now()
                }
            })
        }
    }

    private async processWhatsappNotification(notification: NotificationMessage, userData: NotificationUserData): Promise<void> {
        if (notification.channels.whatsapp && userData.whatsapp) {
            await this.queueManager.addNotification('whatsapp', {
                payload: {
                    to: userData.whatsapp,
                    body: notification.channels.whatsapp.body,
                },
                metadata: {
                    messageId: notification.metadata.messageId,
                    uid: notification.user.uid,
                    priority: notification.metadata.priority,
                    timestamp: Date.now()
                }
            })
        }
    }
}