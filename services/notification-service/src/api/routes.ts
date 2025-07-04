import { Application, Router } from "express";
import { asyncHandler, authenticate, authorize, idValidate } from "@repo/lib";
import { UserNotificationDataRepository } from "../repository/user-data.repository";
import { UserNotificationDataController } from "../controllers/user-data.controller";
import { NotificationTopicsRepository } from "../repository/topics.repository";
import { NotificationPreferencesRepository } from "../repository/preferences.repository";
import { NotificationPreferencesController } from "../controllers/preferences.controller";
import { validateMongoObjectId } from "../validations/base";

/**********************************
 * User data routes
 **********************************/

const userDataRouter = Router();

const userDataRepository = new UserNotificationDataRepository();
const userDataController = new UserNotificationDataController(userDataRepository);

userDataRouter.post('/', authenticate, asyncHandler(userDataController.setUserData));


/**********************************
 * Topics routes
 **********************************/

const preferencesRouter = Router();

const preferencessRepository = new NotificationPreferencesRepository();
const topicsRepository = new NotificationTopicsRepository();
const preferencessController = new NotificationPreferencesController(preferencessRepository, topicsRepository);

preferencesRouter
    .get('/', authenticate, asyncHandler(preferencessController.getByUid))
    .patch('/:id', authenticate, idValidate(validateMongoObjectId), asyncHandler(preferencessController.updatePreferenceChannel))
    .get('/topics', authenticate, authorize(['admin']), asyncHandler(preferencessController.getAllTopics))
    .post('/topics', authenticate, authorize(['admin']), asyncHandler(preferencessController.createTopic))
    .put('/topics/:id', authenticate, authorize(['admin']), idValidate(validateMongoObjectId), asyncHandler(preferencessController.updateTopic))
    .delete('/topics/:id', authenticate, authorize(['admin']), idValidate(validateMongoObjectId), asyncHandler(preferencessController.deleteTopic))

    
/**********************************
 * App routes
 **********************************/

const appRouter = Router();

appRouter.use('/user-data', userDataRouter);
appRouter.use('/preferences', preferencesRouter)

/**********************************
 * Initialize routes
 **********************************/

export function initializeRoutes (app: Application) {
    app.use('/notifications', appRouter);
}
