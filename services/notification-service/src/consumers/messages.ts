export interface MessageMetadata {
    messageId: string;
    timestamp: number;
    priority?: number;
}

export interface MessageUser {
    uid: string,
    email?: string, 
    phone_number?: string, 
    whatsapp?: string,
    device_token?: string
}

type ChannelPayload = {
    title?: string,
    body: string,
    data?: object
}

export interface NotificationMessage {
    metadata: MessageMetadata;
    user: MessageUser;
    channels: {
        email?: ChannelPayload;
        sms?: ChannelPayload;
        push?: ChannelPayload;
        whatsapp?: ChannelPayload
    };
}
