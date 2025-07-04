import { Request, Response } from "express";
import { NotificationPreferencesRepository } from "../repository/preferences.repository";
import { errorResponse, successResponse, STATUS_CODES } from "@repo/lib";
import { validateCreateTopicRequest, validateUpdatePreferenceChannelRequest } from "../validations/requests";
import { NotificationTopicsRepository } from "../repository/topics.repository";

export class NotificationPreferencesController {
    private preferencesRepo: NotificationPreferencesRepository;
    private topicsRepo: NotificationTopicsRepository;

    constructor(preferencesRepo: NotificationPreferencesRepository, topicsRepo: NotificationTopicsRepository) {
        this.topicsRepo = topicsRepo;
        this.preferencesRepo = preferencesRepo;
    }

    getByUid = async (req: Request, res: Response) => {
        const { uid, role } = req.user;

        let preferences = await this.preferencesRepo.getPreferences(uid);
        if (!preferences || preferences.length === 0) {
            const topicsOfTenant = await this.topicsRepo.findManyByAttr({ tenant: role });
            if (!topicsOfTenant || topicsOfTenant.length === 0) {
                res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Bad request, no topics found for the tenant'));
                return;
            }

            for (const topic of topicsOfTenant) {
                const preference = {
                    uid,
                    topic: topic._id,
                    channels: topic.channels.map(channel => ({ type: channel, status: true }))
                };
                await this.preferencesRepo.create(preference);
            }

            preferences = await this.preferencesRepo.getPreferences(uid);
        }       

        res.status(STATUS_CODES.OK).send(successResponse(preferences));
    }

    updatePreferenceChannel = async (req: Request, res: Response) => {
        const { id } = req.params;

        const { error, value } = validateUpdatePreferenceChannelRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse(error.details[0].message));
            return;
        }

        let preference = await this.preferencesRepo.findById(id);
        if (!preference) {
            res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Preference not found'));
            return;
        }

        const { uid } = req.user;
        if (uid != preference.uid) {
            res.status(STATUS_CODES.FORBIDDEN).json(errorResponse('Forbidden request'));
            return;
        }

        const updated = await this.preferencesRepo.updatePreference(id, value);
        res.status(STATUS_CODES.OK).send(successResponse(updated));
    } 

    getAllTopics = async (req: Request, res: Response) => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const topics = await this.topicsRepo.findAll(page, limit);
        res.status(STATUS_CODES.OK).json(successResponse(topics));
    }

    createTopic = async (req: Request, res: Response) => {
        const { error, value } = validateCreateTopicRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse(error.details[0].message));
            return;
        }

        let topic = await this.topicsRepo.findOneByAttr({ 'id': value.id });
        if (topic) {
            res.status(STATUS_CODES.CONFLICT).json(errorResponse('Topic already exists'));
            return;
        }
    
        topic = await this.topicsRepo.create(value);
        res.status(STATUS_CODES.CREATED).json(successResponse(topic));
    }

    updateTopic = async (req: Request, res: Response) => {
        const { id } = req.params;
        
        const { error, value } = validateCreateTopicRequest(req.body);
        if (error) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorResponse(error.details[0].message));
            return;
        }
        
        const updated = await this.topicsRepo.update(id, value);
        if (!updated) {
            res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Topic not found' ));
            return;
        }

        res.status(STATUS_CODES.OK).json(successResponse(updated));
    }

    deleteTopic = async (req: Request, res: Response) => {
        const { id } = req.params;

        const deleted = await this.topicsRepo.delete(id);
        if (!deleted) {
            res.status(STATUS_CODES.NOT_FOUND).json(errorResponse('Topic not found'));
            return;
        }

        res.json(successResponse(null, 'Deleted successfully'));
    }
}