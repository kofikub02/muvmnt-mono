/**
 * Configuration class for the application.
 */
class AppConfig {
    public NODE_ENV: string;
    public APP_ID: string;
    public API_PORT: number;
    public JWT_SECRET: string;
    public CLI_FIREBASE_PROJECT_ID: string;
    public CLI_FIREBASE_CLIENT_ID: string;
    public CLI_FIREBASE_CLIENT_EMAIL: string;
    public CLI_FIREBASE_PRIVATE_KEY: string;
    public BUS_FIREBASE_PROJECT_ID: string;
    public BUS_FIREBASE_CLIENT_ID: string;
    public BUS_FIREBASE_CLIENT_EMAIL: string;
    public BUS_FIREBASE_PRIVATE_KEY: string;
    public PRO_FIREBASE_PROJECT_ID: string;
    public PRO_FIREBASE_CLIENT_ID: string;
    public PRO_FIREBASE_CLIENT_EMAIL: string;
    public PRO_FIREBASE_PRIVATE_KEY: string;
    public ADMIN_FIREBASE_PROJECT_ID: string;
    public ADMIN_FIREBASE_CLIENT_ID: string;
    public ADMIN_FIREBASE_CLIENT_EMAIL: string;
    public ADMIN_FIREBASE_PRIVATE_KEY: string;

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV || 'dev';
        this.APP_ID = process.env.APP_ID || 'auth-service';
        this.API_PORT = parseInt(process.env.API_PORT || '6002');
        this.JWT_SECRET = process.env.JWT_SECRET || '';
        this.CLI_FIREBASE_PROJECT_ID = process.env.CLI_FIREBASE_PROJECT_ID || '';
        this.CLI_FIREBASE_CLIENT_ID = process.env.CLI_FIREBASE_CLIENT_ID || '';
        this.CLI_FIREBASE_CLIENT_EMAIL = process.env.CLI_FIREBASE_CLIENT_EMAIL || '';
        this.CLI_FIREBASE_PRIVATE_KEY = (process.env.CLI_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        this.BUS_FIREBASE_PROJECT_ID = process.env.BUS_FIREBASE_PROJECT_ID || '';
        this.BUS_FIREBASE_CLIENT_ID = process.env.BUS_FIREBASE_CLIENT_ID || '';
        this.BUS_FIREBASE_CLIENT_EMAIL = process.env.BUS_FIREBASE_CLIENT_EMAIL || '';
        this.BUS_FIREBASE_PRIVATE_KEY = (process.env.BUS_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        this.PRO_FIREBASE_PROJECT_ID = process.env.PRO_FIREBASE_PROJECT_ID || '';
        this.PRO_FIREBASE_CLIENT_ID = process.env.PRO_FIREBASE_CLIENT_ID || '';
        this.PRO_FIREBASE_CLIENT_EMAIL = process.env.PRO_FIREBASE_CLIENT_EMAIL || '';
        this.PRO_FIREBASE_PRIVATE_KEY = (process.env.PRO_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        this.ADMIN_FIREBASE_PROJECT_ID = process.env.ADMIN_FIREBASE_PROJECT_ID || '';
        this.ADMIN_FIREBASE_CLIENT_ID = process.env.ADMIN_FIREBASE_CLIENT_ID || '';
        this.ADMIN_FIREBASE_CLIENT_EMAIL = process.env.ADMIN_FIREBASE_CLIENT_EMAIL || '';
        this.ADMIN_FIREBASE_PRIVATE_KEY = (process.env.ADMIN_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    }
}

/**
 * Configuration instance for the application.
 */
export const appConfig: AppConfig = new AppConfig();

