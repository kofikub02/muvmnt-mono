/**
 * Configuration class for the application.
 */
class AppConfig {
    public NODE_ENV: string;
    public APP_ID: string;
    public API_PORT: number;
    public GATEWAY_URL: string;
    public JWT_SECRET: string;
    public KAFKA_BROKERS: string[];
    public KAFKA_USERNAME: string;
    public KAFKA_PASSWORD: string;
    public KAFKA_SASL_MECHANISM: string;
    public MONGODB_URI: string;
    public STRIPE_SECRET_KEY: string;
    public STRIPE_PUBLISHABLE_KEY: string;
    public STRIPE_ENDPOINT_SECRET: string;
    public PAYSTACK_SECRET_KEY: string;
    public PAYSTACK_PUBLIC_KEY: string;
    public PAYSTACK_URL: string;
    public PAYPAL_SECRET_KEY: string;
    public PAYPAL_CLIENT_ID: string;
    public PAYPAL_URL: string;

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV || '';
        this.APP_ID = process.env.APP_ID || '';
        this.API_PORT = parseInt(process.env.API_PORT || '3000');
        this.GATEWAY_URL = process.env.GATEWAY_URL || '';
        this.JWT_SECRET = process.env.JWT_SECRET || '';
        this.KAFKA_BROKERS = (process.env.KAFKA_BROKERS || '').split(',');
        this.KAFKA_USERNAME = process.env.KAFKA_USERNAME || '';
        this.KAFKA_PASSWORD = process.env.KAFKA_PASSWORD || '';
        this.KAFKA_SASL_MECHANISM = process.env.KAFKA_SASL_MECHANISM || '';
        this.MONGODB_URI = process.env.MONGODB_URI || '';
        this.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
        this.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || '';
        this.STRIPE_ENDPOINT_SECRET = process.env.STRIPE_ENDPOINT_SECRET || '';
        this.PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
        this.PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
        this.PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY || '';
        this.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
        this.PAYPAL_URL = process.env.PAYPAL_URL || '';
        this.PAYSTACK_URL = process.env.PAYSTACK_URL || '';
    }
}

/**
 * Configuration instance for the application.
 */
export const appConfig: AppConfig = new AppConfig();

export enum KafkaTopics {
    SEND_NOTIFICATION = 'send-notification',
    UPDATE_ORDER = 'update-order',
    PROCESS_PAYMENT = 'process-payment'
}