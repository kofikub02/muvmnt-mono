import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import { appConfig } from "../app-config";
import { decodeFirebaseAuthToken } from "../services/firebase";
import { isValidTenant, Tenant } from "../services/firebase";
import { getSecondPart } from "../lib/util";
import { STATUS_CODES, errorResponse, successResponse } from "@repo/lib";

export const generateAccessTokenFromFirebaseToken = async (req: Request, res: Response) => {
    const { tenant } = req.params;
    if (!tenant || !isValidTenant(tenant)) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Invalid request'));
        return;
    }

    const firebaseToken = req.headers.authorization?.split('Bearer ')[1];

    if (!firebaseToken) {
        res.status(STATUS_CODES.UNAUTHORISED).send(errorResponse('Authorization token absent'));
        return;
    }

    let decodedToken = await decodeFirebaseAuthToken(firebaseToken, tenant as Tenant);
    if (!decodedToken) {
        res.status(STATUS_CODES.UNAUTHORISED).send(errorResponse('Invalid token')); 
        return;
    }

    const { uid } = decodedToken;
    const role = getSecondPart(tenant);
    if (!role) {
        throw new Error('');
    }
    
    const customJwtPayload = { uid, role };
    const customJwt = sign(customJwtPayload, appConfig.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    
    res.status(STATUS_CODES.OK).send(successResponse(customJwt));
}