import { KafkaTopics } from "../app-config";
import { KafkaProducer } from "@repo/lib";

type UpdateOrderMessage = {
    order_id: string,
    action_data: { status: string },
};

export async function updateOrder(
    user: { uid: string },
    message: UpdateOrderMessage,   
) {
    await KafkaProducer.getInstance().sendMessage(KafkaTopics.UPDATE_ORDER, { 
        user,
        message: {
            ...message,
            action_type: 'payment'
        }
    });
}