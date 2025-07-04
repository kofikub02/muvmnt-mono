export interface MessageMetadata {
    messageId: string;
    timestamp: number;
    priority?: number;
}

export interface MessageUser {
    uid: string,
}

type ActionPayload = {
    action_data: {
        gateway?: 'stripe' | 'paypal' | 'momo',
        method_id?: string,
        amount?: number,
        currency?: string,
        transaction_id?: string 
    },
    action_type: 'create' | 'refund',
    entity_id: string
}

export interface ProcessPaymentMessage {
    metadata: MessageMetadata;
    user: MessageUser;
    message: ActionPayload;
}
