import { isValidTenant, getFirebaseAuth, decodeFirebaseAuthToken, getFirebaseAdminApp } from "./firebase";
import * as admin from 'firebase-admin';

describe('Firebase Service - Inits', () => {
    const tenant = 'muvmnt_cli';
    const mockAuth = { verifyIdToken: jest.fn() };
    const mockApp = { name: tenant, auth: () => mockAuth };

    beforeEach(() => {
        (admin.apps as any).length = 0;
        (admin.initializeApp as jest.Mock).mockReturnValue(mockApp);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('isValidTenant', () => {
        it('should return true for a valid tenant', () => {
            expect(isValidTenant('muvmnt_cli')).toBe(true);
            expect(isValidTenant('muvmnt_bus')).toBe(true);
        });

        it('should return false for an invalid tenant', () => {
            expect(isValidTenant('invalid_tenant')).toBe(false);
            expect(isValidTenant('')).toBe(false);
            expect(isValidTenant(undefined as any)).toBe(false);
            expect(isValidTenant(null as any)).toBe(false);
        });
    });

    describe('getFirebaseAdminApp', () => {
        it('should initialize app if not present', () => {
            const app = getFirebaseAdminApp(tenant);
            expect(app).toBe(mockApp);
            expect(admin.initializeApp).toHaveBeenCalled();
        });

        it('should return existing app if present', () => {
            (admin.apps as any).push(mockApp);
            const app = getFirebaseAdminApp(tenant);
            expect(app).toBe(mockApp);
            expect(admin.initializeApp).not.toHaveBeenCalled();
        });

        it('should get auth from app', () => {
            (admin.apps as any).push(mockApp);
            const auth = getFirebaseAuth(tenant);
            expect(auth).toBe(mockAuth);
        });

        it('should get the correct app based on tenat', () => {
            const anotherTenant = 'muvmnt_bus';
            const anotherMockAuth = { verifyIdToken: jest.fn() };
            const anotherMockApp = { name: anotherTenant, auth: () => anotherMockAuth };

            (admin.apps as any).push(mockApp, anotherMockApp);

            const app1 = getFirebaseAdminApp(tenant);
            const app2 = getFirebaseAdminApp(anotherTenant);

            expect(app1).toBe(mockApp);
            expect(app2).toBe(anotherMockApp);
        });
    });

    describe('decodeFirebaseAuthToken', () => {
        it('should decode and verify a valid token', async () => {
            mockAuth.verifyIdToken.mockResolvedValue({ uid: 'user123' });
            const result = await decodeFirebaseAuthToken('token', tenant);
            expect(result).toEqual({ uid: 'user123' });
        });

        it('should return null for invalid token', async () => {
            mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));
            const result = await decodeFirebaseAuthToken('badtoken', tenant);
            expect(result).toBeNull();
        });
    });
});