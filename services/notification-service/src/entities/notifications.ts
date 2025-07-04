export interface NotificationPayload {
    to: string | string[];
    title?: string;
    body: string;
    data?: Record<string, any>;
}

export interface NotificationResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface QueueJobData {
    payload: NotificationPayload;
    metadata?: {
        messageId: string;
        uid: string;
        timestamp?: number;
        priority?: number;
    };
}

export interface NotificationUserData {
    uid: string;
    email: string  | null;
    phone_number: string  | null;
    device_token: string  | null;
    whatsapp: string | null;
}