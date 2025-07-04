import { Request, Response } from "express";
import { UserNotificationDataRepository } from "../repository/user-data.repository";
import { validateUserDataRequest } from "../validations/requests";
import { errorResponse, successResponse, STATUS_CODES } from "@repo/lib";

export class UserNotificationDataController {
    private repository: UserNotificationDataRepository;

    constructor(respository: UserNotificationDataRepository) {
        this.repository = respository;
    }

    setUserData = async (req: Request, res: Response) => {
        const { error, value } = validateUserDataRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse(error.details[0].message));
            return;
        }

        const { uid } = req.user;
        const userData = await this.repository.findOneByAttr({ uid });
        if (userData) {
            await this.repository.update(userData.id, value)
        } else {
            await this.repository.create({ uid, ...value });
        }
        
        res.status(STATUS_CODES.OK).send(successResponse(null));
    }
}