import { Application, Router } from "express";
import { asyncHandler } from "@repo/lib";
import { generateAccessTokenFromFirebaseToken } from "../controllers/token.controller";

/**********************************
 * Token routes
 **********************************/
const tokenRouter = Router();

tokenRouter.get('/:tenant', asyncHandler(generateAccessTokenFromFirebaseToken));

/**********************************
 * App routes
 **********************************/
const appRouter = Router();

appRouter.use('/token', tokenRouter);

/**********************************
 * Initialize routes
 **********************************/
export function initializeRoutes (app: Application) {    
    app.use('/auth', appRouter);
}
