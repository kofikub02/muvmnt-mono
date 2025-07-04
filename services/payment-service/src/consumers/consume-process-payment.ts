import { KafkaTopics } from "../app-config";
import { KafkaMessageProcessor, ProcessorMessageData } from "@repo/lib";
import logger from "../lib/logger";
import { valiateCreatePaymentConsumerRequest } from "../validations/payment.validation";
import { ProcessPaymentMessage } from "./messages";

export class ProcessPaymentConsumer extends KafkaMessageProcessor {
    constructor() {
        super(KafkaTopics.PROCESS_PAYMENT);
    }
    
    validateMessage(message: any): void {
        const { error } = valiateCreatePaymentConsumerRequest(message);
        if (error) {
            throw new Error(error.details[0].message);
        }
    }

    async processMessage({ message }: ProcessorMessageData): Promise<void> {
        try {
            const orderMessage: ProcessPaymentMessage = message;
      
            this.validateMessage(orderMessage);

            console.log(orderMessage);
        } catch (error) {
            logger.error('Error processing message:', error);
        }
    }
}