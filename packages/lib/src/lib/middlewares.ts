import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from "express";
import { STATUS_CODES } from "./status-codes";
import { errorResponse } from "./api-response";
import { verifyJWT } from "../utils/jwt";
import { Logger } from "winston";

/**
 * Handles request logging errors by logging the error and sending a JSON response with the error message.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call.
 */
export const requestLogger = (logger: Logger) => (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
  
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
  
    next();
};

/**
 * Authenticates the user by verifying the JWT token.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call.
 */
export const authenticate: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract the authorization header from the request headers
        const { authorization } = req.headers;
        if (!authorization) {
            // If authorization header is missing, return a 401 Unauthorized response
            res.status(STATUS_CODES.UNAUTHORISED).json(errorResponse("Authorization header is missing"));
            return;
        }

        // Extract the token from the authorization header
        const token = authorization.split(" ")[1];

        // Get and verify secret
        const secret = process.env.GATEWAY_JWT_SECRET;
        if (!secret) {
            throw new Error('Set GATEWAY_JWT_SECRET');
        }

        // Verify token and extract user info
        const decodedToken = verifyJWT(secret, token);
        const { uid, role } = decodedToken as { uid: string, role: string };
        req.user = { uid, role };

        // Continue to the next middleware
        next();
    } catch (error) {
        res.status(STATUS_CODES.UNAUTHORISED).json(errorResponse("Invalid or expired token"));
        return;
    }
}

/**
 * Authorizes the user by checking if the user has the required roles and types.
 * 
 * @param allowedRoles - An array of allowed roles.
 * @param allowedTypes - An array of allowed types.
 * @returns A middleware function that checks the user's roles and types.
 */
export const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Extract user roles and types from the request object
        const { role } = req.user!;
        // Check if the user has any of the allowed roles
        if (allowedRoles.length > 0) {
            // Check if the user has any of the allowed roles
            if (!allowedRoles.find(r => r === role)) {
                // If the user does not have any of the allowed roles, return a 403 Forbidden response
                res.status(STATUS_CODES.FORBIDDEN).json(errorResponse("Resource forbidden"));
                return;
            }
        }

        // Continue to the next middleware
        next();
    };
};

/**
 * Validates the id of the resource
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call.
 */
/**
 * Validates the id of the resource.
 * 
 * @param validateId - A function that takes a string id and returns a boolean indicating validity.
 * @returns A middleware function that validates the id parameter in the request.
 */
export const idValidate = (validateId: (id: string) => boolean) => (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!id || !validateId(id)) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Invalid resource request'));
        return;
    }

    next();
};

/**
 * Wraps an asynchronous request handler in a Promise to catch any errors.
 * 
 * @param fn - The asynchronous request handler.
 * @returns A middleware function that handles errors from the asynchronous request handler.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

/**
 * Handles 404 errors by sending a JSON response with the error message.
 * 
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call.
 */
export const notFoundHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(STATUS_CODES.NOT_FOUND).json(errorResponse(`Route not found: ${req.originalUrl}`));
};

/**
 * Handles internal server errors by logging the error and sending a JSON response with the error message.
 * 
 * @param err - The error object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call.
 */
export const errorHandler  = (logger: Logger): ErrorRequestHandler => (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Log the error to the console
    logger.error(err.stack);

    // Send an error response to the client
    res.status(STATUS_CODES.INTERNAL_ERROR).json(errorResponse('Internal Server Error'));
};