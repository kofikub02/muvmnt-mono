class AppConfig {
    public NODE_ENV: string;
    public APP_ID: string;
    public API_PORT: number;
    public GATEWAY_JWT_SECRET: string;
    public MONGODB_URI: string;
    public KAFKA_BROKERS: string[];
    public KAFKA_USERNAME: string;
    public KAFKA_PASSWORD: string;
    public KAFKA_SASL_MECHANISM: string;
    public MAILER_SERVICE: string;
    public MAILER_HOST: string;
    public MAILER_PORT: string;
    public MAILER_USER: string;
    public MAILER_PASSWORD: string;
    public MAILER_NAME: string;
    public CLI_FIREBASE_PROJECT_ID: string;
    public CLI_FIREBASE_CLIENT_EMAIL: string;
    public CLI_FIREBASE_PRIVATE_KEY: string;
    public BUS_FIREBASE_PROJECT_ID: string;
    public BUS_FIREBASE_CLIENT_EMAIL: string;
    public BUS_FIREBASE_PRIVATE_KEY: string;
    public PRO_FIREBASE_PROJECT_ID: string;
    public PRO_FIREBASE_CLIENT_EMAIL: string;
    public PRO_FIREBASE_PRIVATE_KEY: string;
    public ADMIN_FIREBASE_PROJECT_ID: string;
    public ADMIN_FIREBASE_CLIENT_EMAIL: string;
    public ADMIN_FIREBASE_PRIVATE_KEY: string;
    public TWILIO_ACCOUNT_SID: string;
    public TWILIO_AUTH_TOKEN: string;
    public TWILIO_PHONE_NUMBER: string;
    public TWILIO_WHATSAPP_NUMBER: string;
    public REDIS_URI: string;
    public REDIS_PORT: number;
    public REDIS_PASSWORD: string;

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV || 'dev';
        this.APP_ID = process.env.APP_ID || '';
        this.API_PORT = parseInt(process.env.API_PORT || '3000');
        this.GATEWAY_JWT_SECRET = process.env.GATEWAY_JWT_SECRET || '';
        this.MONGODB_URI = process.env.MONGODB_URI || '';
        this.KAFKA_BROKERS = (process.env.KAFKA_BROKERS || '').split(',');
        this.KAFKA_USERNAME = process.env.KAFKA_USERNAME || '';
        this.KAFKA_PASSWORD = process.env.KAFKA_PASSWORD || '';
        this.KAFKA_SASL_MECHANISM = process.env.KAFKA_SASL_MECHANISM || 'plain';
        this.MAILER_SERVICE = process.env.MAILER_SERVICE || '';
        this.MAILER_HOST = process.env.MAILER_HOST || '';
        this.MAILER_PORT = process.env.MAILER_PORT || '';
        this.MAILER_USER = process.env.MAILER_USER || '';
        this.MAILER_PASSWORD = process.env.MAILER_PASSWORD || '';
        this.MAILER_NAME = process.env.MAILER_NAME || '';
        this.CLI_FIREBASE_PROJECT_ID = process.env.CLI_FIREBASE_PROJECT_ID || '';
        this.CLI_FIREBASE_CLIENT_EMAIL = process.env.CLI_FIREBASE_CLIENT_EMAIL || '';
        this.CLI_FIREBASE_PRIVATE_KEY = (process.env.CLI_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        this.BUS_FIREBASE_PROJECT_ID = process.env.BUS_FIREBASE_PROJECT_ID || '';
        this.BUS_FIREBASE_CLIENT_EMAIL = process.env.BUS_FIREBASE_CLIENT_EMAIL || '';
        this.BUS_FIREBASE_PRIVATE_KEY = (process.env.BUS_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        this.PRO_FIREBASE_PROJECT_ID = process.env.PRO_FIREBASE_PROJECT_ID || '';
        this.PRO_FIREBASE_CLIENT_EMAIL = process.env.PRO_FIREBASE_CLIENT_EMAIL || '';
        this.PRO_FIREBASE_PRIVATE_KEY = (process.env.PRO_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        this.ADMIN_FIREBASE_PROJECT_ID = process.env.ADMIN_FIREBASE_PROJECT_ID || '';
        this.ADMIN_FIREBASE_CLIENT_EMAIL = process.env.ADMIN_FIREBASE_CLIENT_EMAIL || '';
        this.ADMIN_FIREBASE_PRIVATE_KEY = (process.env.ADMIN_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        this.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
        this.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
        this.TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
        this.TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';
        this.REDIS_URI = process.env.REDIS_URI || '';
        this.REDIS_PORT = parseInt(process.env.REDIS_PORT || '');
        this.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
    }
}

export const appConfig: AppConfig = new AppConfig();

export const redisConnectionOptions = { 
    port: appConfig.REDIS_PORT,
    host: appConfig.REDIS_URI,
    password: appConfig.REDIS_PASSWORD,
};

export const mailerOptions = {
    sender: {
        name: appConfig.MAILER_NAME,
        address: appConfig.MAILER_USER
    },
    transportOptions: {
        service: appConfig.MAILER_SERVICE, 
        host: appConfig.MAILER_HOST, 
        auth: {
            user: appConfig.MAILER_USER, 
            pass: appConfig.MAILER_PASSWORD,
        }
    }
};

export const firebaseOptions = {
    projectId: appConfig.CLI_FIREBASE_PROJECT_ID,
    clientEmail: appConfig.CLI_FIREBASE_CLIENT_EMAIL,
    privateKey: appConfig.CLI_FIREBASE_PRIVATE_KEY
};

export const smsTwilioOptions = {
    accountSid: appConfig.TWILIO_ACCOUNT_SID,
    authToken: appConfig.TWILIO_AUTH_TOKEN,
    smsFromNumber: appConfig.TWILIO_PHONE_NUMBER,
};

export const whatsappTwilioOptions = {
    accountSid: appConfig.TWILIO_ACCOUNT_SID,
    authToken: appConfig.TWILIO_AUTH_TOKEN,
    whatsappFromNumber: appConfig.TWILIO_WHATSAPP_NUMBER,
};

export enum KafkaTopics {
    // consuming topics
    SEND_NOTIFICATION = 'send-notification',
};