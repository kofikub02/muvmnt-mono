import request from 'supertest';
import app from '../express-app';
import { generateAccessTokenFromFirebaseToken } from './token.controller';
import * as admin from 'firebase-admin';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn((payload: string | object) => `${(payload as any).uid}${(payload as any).role}`),
    decode: jest.fn((token: string) => {
        if (token === 'user_1cli') {
            return { uid: 'user_1', role: 'cli' };
        }
        if (token === 'user_2cli') {
            return { uid: 'user_2', role: 'cli' };
        }
        if (token === 'user_3bus') {
            return { uid: 'user_3', role: 'bus' };
        }
        return null;
    }),
}));

import { decode } from 'jsonwebtoken';

describe('Token Controller', () => {
    describe('Generate Access Token From Firebase Token', () => {
        const mockAuth = { verifyIdToken: jest.fn() };
        
        beforeAll(() => {
            app.use('/auth/token/:tenant', generateAccessTokenFromFirebaseToken);
        });

        it('should return 404 for GET /auth/token', async () => {
            const res = await request(app).get('/auth/token');
            expect(res.status).toBe(404);
        });

        it('should return 400 if invalid tenant is provided as param', async () => {
            const res = await request(app).get('/auth/token/invalid');
            expect(res.status).toBe(400);
        });

        it('should return 401 if no bearer token is included in header', async () => {
            const tenant = 'muvmnt_cli';
            const res = await request(app).get(`/auth/token/${tenant}`);
            expect(res.status).toBe(401);
        });

        it('should return 401 if bearer token is invalid', async () => {
            mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));
            
            const res = await request(app)
                .get('/auth/token/muvmnt_cli')
                .set('Authorization', 'Bearer invalidtoken');
            
            expect(res.status).toBe(401);
            expect(res.body.success).toBeFalsy();
            expect(res.body).toHaveProperty('error');
        });

        it('should return 200 if valid token is passed to header', async () => {
            const tenant = 'muvmnt_cli';
            (admin.apps as any).length = 0;
            (admin.initializeApp as jest.Mock).mockReturnValue({ name: tenant, auth: () => mockAuth });

            const validToken = 'some_token_representing_user_1';
            mockAuth.verifyIdToken.mockResolvedValue({ uid: 'user_1' });

            const res = await request(app)
                .get('/auth/token/muvmnt_cli')
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBeTruthy();
        });

        it('should return 200 and token contains uid and role when decoded', async () => {
            const tenant = 'muvmnt_cli';
            (admin.apps as any).length = 0;
            (admin.initializeApp as jest.Mock).mockReturnValue({ name: tenant, auth: () => mockAuth });

            const validToken = 'another_valid_token';
            const expectedUid = 'user_2';
            mockAuth.verifyIdToken.mockResolvedValue({ uid: expectedUid });

            const res = await request(app)
                .get(`/auth/token/${tenant}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBeTruthy();
            expect(typeof res.body.data).toBe('string');

            // Decode JWT to verify payload
            const decoded = decode(res.body.data);

            expect(decoded).toBeTruthy();
            expect(typeof decoded === 'object' && decoded !== null).toBe(true);
            expect(decoded).toHaveProperty('uid', expectedUid);
            expect(decoded).toHaveProperty('role');
            if (typeof decoded === 'object' && decoded !== null) {
                expect((decoded as any).role).toBeDefined();
                expect((decoded as any).role).toBe('cli');
            }
        });

        it('should return 200 and token contains correct role based on tenant', async () => {
            const tenant = 'muvmnt_bus';
            (admin.apps as any).length = 0;
            (admin.initializeApp as jest.Mock).mockReturnValue({ name: tenant, auth: () => mockAuth });

            const validToken = 'tenant_based_token';
            const expectedUid = 'user_3';
            mockAuth.verifyIdToken.mockResolvedValue({ uid: expectedUid });

            const res = await request(app)
                .get(`/auth/token/${tenant}`)
                .set('Authorization', `Bearer ${validToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBeTruthy();
            expect(typeof res.body.data).toBe('string');

            console.log(res.body.data);

            const decoded = decode(res.body.data);

            expect(decoded).toBeTruthy();
            expect(typeof decoded === 'object' && decoded !== null).toBe(true);
            expect(decoded).toHaveProperty('uid', expectedUid);
            expect(decoded).toHaveProperty('role');
            if (typeof decoded === 'object' && decoded !== null) {
                expect((decoded as any).role).toBe('bus');
            }
        });
    });
});