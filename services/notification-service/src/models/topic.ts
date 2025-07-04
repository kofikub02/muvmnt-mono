import { model, Schema, Document } from "mongoose";
import { INotificationTopic } from "../entities/topic";
import { ChannelType, TenantType } from "../entities/base";

interface NotificationTopicDocument extends INotificationTopic, Document {}

const NotificationTopicSchema = new Schema<NotificationTopicDocument>({
    code: {type: String, unique: true, required: true},
    name: { type: String, required: true },
    description: { type: String, required: true },
    tenant: { 
      type: String, 
      enum: Object.values(TenantType), 
      required: true,
    },
    channels: {
      type: [String],
      enum: Object.values(ChannelType),
      required: true,
      default: [],
    },
});

const NotificationTopicModel = model<NotificationTopicDocument>('NotificationTopic', NotificationTopicSchema);

export { NotificationTopicModel as TopicModel, NotificationTopicDocument }
  