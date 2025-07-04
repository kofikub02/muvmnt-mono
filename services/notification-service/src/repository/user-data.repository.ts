import { UserNotificationDataDocument, UserNotificationDataModel } from "../models/user-data";
import { BaseMongoDBRepository } from "@repo/lib";

/**
 * UserNotificationData repository in the service.
 */
export class UserNotificationDataRepository extends BaseMongoDBRepository<UserNotificationDataDocument, typeof UserNotificationDataModel> {
    constructor() {
      super(UserNotificationDataModel);
    }
}
  