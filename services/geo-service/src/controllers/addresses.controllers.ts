import { Request, Response } from "express";
import { AddressesRepository } from "../repository/addresses.repository";
import { validateCreateAddressRequest, validateUpdateAddressRequest } from "../validations/addresses.validation";
import { errorResponse, STATUS_CODES, successResponse } from "@repo/lib";

export class AddressesController {
    private repository: AddressesRepository;

    constructor(respository: AddressesRepository) {
        this.repository = respository;
    }

    /**
     * @description Create and save an address
     * 
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {Promise<void>}
     */
    saveAddress = async (req: Request, res: Response) => {
        const { error, value } = validateCreateAddressRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse(error.details[0].message));
            return;
        }

        const { uid } = req.user;

        let place = await this.repository.findOneByAttr({ 'uid': uid, 'label': value.label });
        if (place) {
            place = await this.repository.update(place.id, value);
            res.status(STATUS_CODES.OK).json(successResponse(place));
            return;
        }
        
        place = await this.repository.create({ ...value, uid });
        res.status(STATUS_CODES.CREATED).json(successResponse(place));
    }


    /**
     * @description Get all the saved addresses of a user by uid
     * 
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {Promise<void>}
     */
    getSavedAddresses = async (req: Request, res: Response) => {
        const { uid } = req.user;
        const places = await this.repository.findManyByAttr({ 'uid': uid });
        res.status(STATUS_CODES.OK).json(successResponse(places));
    }

    /**
     * @description Update a saved address
     * 
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {Promise<void>}
     */
    updateSavedAddress = async (req: Request, res: Response) => {
        const { id } = req.params;

        const { error, value } = validateUpdateAddressRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse(error.details[0].message));
            return;
        }
        
        let place = await this.repository.findById(id);
        if (!place) {
            res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Not found'));
            return;
        }

        const { uid } = req.user;
        if (uid != place.uid) {
            res.status(STATUS_CODES.FORBIDDEN).json(errorResponse('Forbidden request'));
            return;
        }

        place = await this.repository.findOneByAttr({ 'uid': uid, 'label': value.label });
        if (place) {
            if (place.id != id) {
                await this.repository.delete(place.id);
            } else {
                place = await this.repository.update(place.id, value);
                res.status(STATUS_CODES.OK).json(successResponse(place));
                return;
            } 
        }

        place = await this.repository.update(id, value);
        res.status(STATUS_CODES.OK).json(successResponse(place));
    }

    /**
     * @description Delete a saved address
     * 
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {Promise<void>}
     */
    deleteSavedAddress = async (req: Request, res: Response) => {
        const { id } = req.params;

        const place = await this.repository.findById(id);
        if (!place) {
            res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Not found'));
            return;
        }

        const { uid } = req.user;
        if (uid != place.uid) {
            res.status(STATUS_CODES.FORBIDDEN).json(errorResponse('Forbidden request'));
            return;
        }

        await this.repository.delete(id);
        res.status(STATUS_CODES.NO_CONTENT).json(successResponse('Place deleted successfully'));
    }
}