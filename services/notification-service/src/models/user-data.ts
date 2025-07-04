import { Schema, model, Model, Document } from "mongoose";
import { IUserNotificationData } from "../entities/user-data";

interface UserNotificationDataDocument extends IUserNotificationData, Document {}

const UserNotificationDataSchema = new Schema<UserNotificationDataDocument>(
    {
      uid: { type: String, required: true, unique: true },
      tenant: { type: String, required: true, enum: ['cli', 'bus', 'muv'] },
      email: { type: String },
      phone_number: { type: String },
      device_token: { type: String },
    },
    { timestamps: true }
);
  
const UserNotificationDataModel: Model<UserNotificationDataDocument> = model<UserNotificationDataDocument>('UserNotificationData', UserNotificationDataSchema);

export { UserNotificationDataDocument, UserNotificationDataModel }