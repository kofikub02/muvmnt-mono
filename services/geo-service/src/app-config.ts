/**
 * Configuration class for the application.
 */
class AppConfig {
    public NODE_ENV: string;
    public APP_ID: string;
    public API_PORT: number;
    public GATEWAY_URL: string;
    public GATEWAY_JWT_SECRET: string;
    public GOOGLE_MAPS_URL: string;
    public GOOGLE_API_KEY: string;
    public MONGODB_URI: string

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV || '';
        this.APP_ID = process.env.APP_ID || '';
        this.API_PORT = parseInt(process.env.API_PORT || '3000');
        this.GATEWAY_URL = process.env.GATEWAY_URL || '';
        this.GATEWAY_JWT_SECRET = process.env.GATEWAY_JWT_SECRET || '';
        this.GOOGLE_MAPS_URL = process.env.GOOGLE_MAPS_URL || '';
        this.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
        this.MONGODB_URI = process.env.MONGO_URI || '';
    }
}

/**
 * Configuration instance for the application.
 */
export const appConfig: AppConfig = new AppConfig();