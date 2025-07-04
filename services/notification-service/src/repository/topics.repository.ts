import { INotificationTopic } from "../entities/topic";
import { TopicModel } from "../models/topic";
import { BaseMongoDBRepository } from "@repo/lib";

/**
 * UserNotificationData repository in the service.
 */
export class NotificationTopicsRepository extends BaseMongoDBRepository<INotificationTopic, typeof TopicModel> {
    constructor() {
      super(TopicModel);
    }
}