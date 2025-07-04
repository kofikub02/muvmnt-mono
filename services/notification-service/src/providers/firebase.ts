import admin from 'firebase-admin';
import { Messaging } from 'firebase-admin/lib/messaging/messaging';
import { NotificationProvider } from './base';
import { NotificationPayload, NotificationResponse } from '../entities/notifications';
import { ValidationError } from '@repo/lib';
import { validateFirebasePayload } from '../validations/providers';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

export interface FirebaseConfig {
    projectId: string,
    clientEmail: string,
    privateKey: string
}

export class FirebaseMessagingProvider extends NotificationProvider {
    private messaging: Messaging | undefined;

    constructor(config: FirebaseConfig) {
        super('firebase', config);
    }

    async initialize(): Promise<void> {
        try {
            const app = admin.initializeApp({
                credential: admin.credential.cert(this.config),
            });

            this.messaging = app.messaging();
        } catch (error) {
            console.log(`initiailize ${error}`);
            throw new Error(`Failed to initialize Firebase: ${error}`);
        }
    }

    validatePayload(payload: NotificationPayload) {
        const { error } = validateFirebasePayload(payload);

        if (error) {
            throw new ValidationError(error.details[0].message);
        }
    }

    async send(payload: NotificationPayload): Promise<NotificationResponse> {
        try {
            this.validatePayload(payload);
        
            const message: Message = {
                token: payload.to as string,
                data: payload.data,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                android: {
                    priority: 'high' as 'high' | 'normal',
                    notification: {
                        // sound: ''
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                        },
                    },
                },
            };
            
            const response = await this.messaging!.send(message);

            return {
                success: true,
                messageId: response
            };
        } catch (error) {
            console.log(`Process Send: ${error}`);
            return this.handleError(error);
        }
    }
}

