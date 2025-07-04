import { model, Model, Schema, Document } from "mongoose";
import { INotificationPreference } from "../entities/preference";
import { ChannelSchema } from "./base";

interface NotificationPreferenceDocument extends INotificationPreference, Document {}

const NotificationPreferenceSchema = new Schema<NotificationPreferenceDocument>({
    uid: { type: String, required: true },
    topic: { type: Schema.Types.ObjectId, ref: 'NotificationTopic', required: true },
    channels: {
      type: [ChannelSchema],
      required: true,
      default: [],
    },
  }, { 
    toJSON: {
        transform(doc, ret){
            delete ret.uid;
            delete ret.__v;
            delete ret.createdAt
        }
    }, 
    timestamps: true 
});

const NotificationPreferenceModel: Model<NotificationPreferenceDocument> = model<NotificationPreferenceDocument>('NotificationPreference', NotificationPreferenceSchema);

export { NotificationPreferenceDocument, NotificationPreferenceModel }
  