import { Application, Router } from "express";
import { asyncHandler, authenticate, idValidate, successResponse } from "@repo/lib";
import { SearchController } from "../controllers/search.controller";
import { AddressesController } from "../controllers/addresses.controllers";
import { AddressesRepository } from "../repository/addresses.repository";
import { validateMongoObjectId } from "../validations/base";

/**********************************
 * Address routes
 **********************************/
const addressRouter = Router();

const addressController = new SearchController();

addressRouter
     .get('/autocomplete', authenticate, asyncHandler(addressController.getAddressAutocomplete))
     .get('/geocode', authenticate, asyncHandler(addressController.getAddressGeocode))
     .get('/convert', authenticate, asyncHandler(addressController.getGeocodeAddress));

/**********************************
 * Address routes
 **********************************/
const placesRouter = Router();

const placesRepository = new AddressesRepository();
const placesController = new AddressesController(placesRepository);

placesRouter
    .get('/', authenticate, asyncHandler(placesController.getSavedAddresses))
    .post('/', authenticate, asyncHandler(placesController.saveAddress))
    .put('/:id', authenticate, idValidate(validateMongoObjectId), asyncHandler(placesController.updateSavedAddress))
    .delete('/:id', authenticate, idValidate(validateMongoObjectId), asyncHandler(placesController.deleteSavedAddress))

/**********************************
 * App routes
 **********************************/
const appRouter = Router();

appRouter.use('/search', addressRouter);
appRouter.use('/saved', placesRouter);

/**********************************
 * Initialize routes
 **********************************/
export function initializeRoutes (app: Application) {
    app.use('/addresses', appRouter);
}