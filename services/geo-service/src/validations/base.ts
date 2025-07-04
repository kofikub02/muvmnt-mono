import { Types } from "mongoose";


/**
 * Validate if the given id is a valid MongoDB ObjectId
 * 
 * @param id - The id to validate
 * @returns True if the id is a valid MongoDB ObjectId, false otherwise
 */
export const validateMongoObjectId = (id: string) => {
    return Types.ObjectId.isValid(id);
};