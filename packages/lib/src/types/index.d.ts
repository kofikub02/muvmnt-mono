import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: { role: string, uid: string };
        }
    }
}

export {};
