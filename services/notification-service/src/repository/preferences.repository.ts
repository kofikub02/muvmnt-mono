import { IChannel } from "../entities/base";
import { NotificationPreferenceModel, NotificationPreferenceDocument } from "../models/preference";
import { BaseMongoDBRepository } from "@repo/lib";

/**
 * NotificationPreferences repository in the service.
 */
export class NotificationPreferencesRepository extends BaseMongoDBRepository<NotificationPreferenceDocument, typeof NotificationPreferenceModel> {
    constructor() {
      super(NotificationPreferenceModel);
    }

    async getPreferences(uid: string): Promise<NotificationPreferenceDocument[]> {
      return await this.model.find({ uid }).populate('topic', 'name description -_id');
    }

    async updatePreference(id: string, data: { type: IChannel, status: boolean }) {
      const { type, status } = data;
      return await this.model.findOneAndUpdate(
        { _id: id }, 
        { $set: { "channels.$[elem].status": status } }, 
        { arrayFilters: [{ "elem.type": type }], new: true }
      ).populate('topic', 'name description -_id');
    }
}