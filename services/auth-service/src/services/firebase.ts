import admin from 'firebase-admin';
import { appConfig } from "../app-config";

export type Tenant = 'muvmnt_cli' | 'muvmnt_bus' | 'muvmnt_muv' | 'muvmnt_admin';

const validTenants: Set<Tenant> = new Set(['muvmnt_cli', 'muvmnt_bus', 'muvmnt_muv', 'muvmnt_admin']);

export function isValidTenant(value: string): value is Tenant {
  return validTenants.has(value as Tenant);
}

export const tenantConfigs = {
    muvmnt_cli: {
        projectId: appConfig.CLI_FIREBASE_PROJECT_ID,
        clientId: appConfig.CLI_FIREBASE_CLIENT_ID,
        clientEmail: appConfig.CLI_FIREBASE_CLIENT_EMAIL,
        privateKey: appConfig.CLI_FIREBASE_PRIVATE_KEY,
    },
    muvmnt_bus: {
        projectId: appConfig.BUS_FIREBASE_PROJECT_ID,
        clientId: appConfig.BUS_FIREBASE_CLIENT_ID,
        clientEmail: appConfig.BUS_FIREBASE_CLIENT_EMAIL,
        privateKey: appConfig.CLI_FIREBASE_PRIVATE_KEY,
    },
    muvmnt_muv: {
        projectId: appConfig.PRO_FIREBASE_PROJECT_ID,
        clientId: appConfig.PRO_FIREBASE_CLIENT_ID,
        clientEmail: appConfig.PRO_FIREBASE_CLIENT_EMAIL,
        privateKey: appConfig.PRO_FIREBASE_PRIVATE_KEY,
    },
    muvmnt_admin: {
        projectId: appConfig.ADMIN_FIREBASE_PROJECT_ID,
        clientId: appConfig.ADMIN_FIREBASE_CLIENT_ID,
        clientEmail: appConfig.ADMIN_FIREBASE_CLIENT_EMAIL,
        privateKey: appConfig.ADMIN_FIREBASE_PRIVATE_KEY,
    }
} as const;

/**
 * Retrieves the Firebase Admin app instance for the specified tenant.
 * If an app instance for the tenant already exists, it returns the existing instance.
 * Otherwise, it initializes a new app instance using the tenant's configuration.
 *
 * @param tenant - The tenant identifier for which to retrieve the Firebase app.
 * @returns The Firebase Admin app instance associated with the tenant.
 */
export function getFirebaseAdminApp(tenant: Tenant): admin.app.App {
    const existingApp = admin.apps.find(app => app?.name === tenant);
    if (existingApp) {
        return existingApp;
    }
  
    const config = tenantConfigs[tenant];
    const firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(config),
    }, tenant);

    return firebaseApp
}

/**
 * Retrieves the Firebase Auth service for the specified tenant.
 * This provides access to authentication-related operations for the tenant.
 *
 * @param tenant - The tenant identifier for which to retrieve the Auth service.
 * @returns The Firebase Auth service instance for the tenant.
 */
export function getFirebaseAuth(tenant: Tenant): admin.auth.Auth {
    return getFirebaseAdminApp(tenant).auth();
}

/**
 * Decodes and verifies a Firebase authentication token for a given tenant.
 * If the token is valid, returns an object containing the user's UID.
 * If verification fails, returns null.
 *
 * @param token - The Firebase authentication token to decode and verify.
 * @param tenant - The tenant identifier for which to verify the token.
 * @returns An object containing the user's UID if verification succeeds, or null if it fails.
 */
export async function decodeFirebaseAuthToken(token: string, tenant: Tenant): Promise<{ uid: string } | null> {
    try {
        const auth = getFirebaseAuth(tenant);

        const response = await auth.verifyIdToken(token);
        const { uid } = response;

        return { uid };
    } catch (error) {
        return null;
    }
}

