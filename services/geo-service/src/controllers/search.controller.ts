import { Request, Response } from 'express';
import axios from 'axios';
import { appConfig } from '../app-config';
import { errorResponse, STATUS_CODES, successResponse } from '@repo/lib';

const GOOGLE_MAPS_URL = appConfig.GOOGLE_MAPS_URL;
const GOOGLE_API_KEY = appConfig.GOOGLE_API_KEY;

export class SearchController {
    /**
     * @description Auto-complete address based on the given text
     * 
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {Promise<void>}
     */
    getAddressAutocomplete = async (req: Request, res: Response) => {
        const { query, country } = req.query;
        if (!query) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Invalid request'));
            return;
        }
        
        const endPoint = `${GOOGLE_MAPS_URL}/place/autocomplete/json?input=${query}&key=${GOOGLE_API_KEY}${country ? `&components=country:${country}` : '' }`;

        const response = await axios.get(endPoint);
        
        if (response.data.status === 'OK') {
            const predictions = response.data.predictions.map((p: any) => ({
                description: p.description,
                structured_formatting: {
                  main_text: p.structured_formatting?.main_text,
                  secondary_text: p.structured_formatting?.secondary_text,
                },
            }));
            res.status(STATUS_CODES.OK).json(successResponse(predictions));
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Failed to fetch address suggestions'));
        }
    };

    /**
     * @description Geocode an address to get the latitude and longitude
     * 
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {Promise<void>}
     */
    getAddressGeocode = async (req: Request, res: Response) => {
        const { address } = req.query;
        if (!address) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Invalid request'));
            return;
        }

        const endPoint = `${GOOGLE_MAPS_URL}/geocode/json?address=${address}&key=${GOOGLE_API_KEY}`;

        const response = await axios.get(endPoint);

        if (response.data.status === 'OK') {
            const location = response.data.results[0].geometry.location;
            res.status(STATUS_CODES.OK).json(successResponse(location));
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Failed to fetch address for geocode'));
        }
    }   

    /**
     * @description Address a geocode to get the latitude and longitude
     * 
     * @param {Request} req - The request object
     * @param {Response} res - The response object
     * @returns {Promise<void>}
     */
    getGeocodeAddress = async (req: Request, res: Response) => {
        let { lat, lng } = req.query;
        if (lat === undefined || 
            lng === undefined || 
            isNaN(Number(lat)) || 
            isNaN(Number(lng))) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Invalid request'));
            return;
        }

        const endPoint = `${GOOGLE_MAPS_URL}/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;

        const response = await axios.get(endPoint);

        if (response.data.status === 'OK') {
            const location = response.data.results[0].formatted_address;
            res.status(STATUS_CODES.OK).json(successResponse(location));
        } else {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse('Failed to fetch address for geocode'));
        }
    }
}



