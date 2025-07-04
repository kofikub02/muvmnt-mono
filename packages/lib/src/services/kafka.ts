import { Kafka, logLevel, Consumer, Partitioners, Producer, EachMessagePayload, KafkaConfig, SASLOptions} from "kafkajs";
import { v4 as uuidv4 } from 'uuid';
import { winstonLogger } from "../utils/logger";

const logger = winstonLogger('[Kafka]');

export interface ProcessorMessageData {
    key: string | undefined,
    message: any
}

export class KafkaClient {
    private static _instance: KafkaClient;
    private _client: Kafka | undefined;

    private constructor() {}

    public static getInstance(): KafkaClient {
        if (!KafkaClient._instance) {
            KafkaClient._instance = new KafkaClient();
        }
        return KafkaClient._instance;
    }

    public initialize(clientId: string, brokers: string[], sasl?: { mechanism: string, username: string, password: string }) {
        const kafkaConfig: KafkaConfig = {
            clientId: clientId,
            brokers: brokers,
            logLevel: logLevel.INFO,
            logCreator: _ => {
                return (log) => {
                    logger.info(`[Kafka] ${log.label}: ${log.log.message}`);
                };
            }
        };

        if (sasl) {
            kafkaConfig.ssl = true;
            kafkaConfig.sasl = sasl as SASLOptions;          
        }

        this._client = new Kafka(kafkaConfig);
    }

    public get client() {
        if (!this._client) {
            throw new Error(`Kafka Client has not been initialized`);
        }

        return this._client;
    }
}

export class KafkaProducer {
    private static _instance: KafkaProducer;
    private _producer: Producer;

    private constructor() {
        this._producer = KafkaClient.getInstance().client.producer({ 
            createPartitioner: Partitioners.DefaultPartitioner 
        });
    }

    public static getInstance(): KafkaProducer {
        if (!KafkaProducer._instance) {
            KafkaProducer._instance = new KafkaProducer();
        }
        return KafkaProducer._instance;
    }

    async sendMessage(topic: string, message: any): Promise<void> {
        message['metadata'] = {
            messageId: uuidv4(),
            timestamp: Date.now(),
            priority: 1
        },

        await this._producer.connect();
        await this._producer.send({
            topic: topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        await this._producer.disconnect();
    }
}

export class KafkaConsumer {
    private _consumer: Consumer;
    private _subs: Record<string, KafkaMessageProcessor>;

    constructor(groupId: string) {
        this._subs = {}
        this._consumer = KafkaClient.getInstance().client.consumer({ groupId });
        this._consumer.connect()
            .then(() => {
                logger.debug(`Consumer connected to group ${groupId}`); 
            });

        const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;
        signals.forEach((signal) => {
            process.on(signal, async () => {
                await this.destroy();
                process.exit(0);
            });
        });
    }

    public async subscribe(processor: KafkaMessageProcessor) {
        this._subs[processor.topic] = processor;
        await this._consumer?.subscribe({ 
            topic: processor.topic, 
            fromBeginning: false 
        });
        logger.debug(`Consumer subscribed to topic ${processor.topic}`);
    }

    public async consumeMessages() {
        await this._consumer!.run({
            eachMessage: async ({ topic, message }) => {
                if (!message || !message.value) {
                    return;
                }

                const data: ProcessorMessageData = {
                    key: message.key?.toString(),
                    message: JSON.parse(message.value!.toString())
                }
                
                const topicMessageProcessor = this._subs[topic];

                if (topicMessageProcessor) {
                    topicMessageProcessor.processMessage(data);
                }
            }
        });
    }

    public async destroy() {
        await this._consumer?.disconnect();
    }
}

export abstract class KafkaMessageProcessor {
    protected constructor(public readonly topic: string) {}
    abstract validateMessage(message: any): void;
    abstract processMessage(message: ProcessorMessageData): Promise<void>
}