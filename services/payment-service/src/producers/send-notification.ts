import { KafkaTopics } from "../app-config";
import { KafkaClient, KafkaProducer } from "@repo/lib";

type NotificationMessage = {
    title?: string,
    body: string,
    data?: object
}

export async function sendNotification(
    user: {
        uid: string,
        email?: string,
        phone_number?: string
    }, 
    messages: { 
        push?: NotificationMessage, 
        email?: NotificationMessage, 
        sms?: NotificationMessage
    },    
) {
    await KafkaProducer.getInstance().sendMessage(KafkaTopics.SEND_NOTIFICATION, { 
        user,
        channels: {
            push: messages.push,
            email: messages.email,
            sms: messages.sms
        }
    });
}


