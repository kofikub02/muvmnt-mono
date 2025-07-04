import { Document } from "mongoose";
import { ChannelType, TenantType } from "./base";

/**
 * Interface representing an Notification Topic in the system.
 */
export interface INotificationTopic extends Document {
    code: string
    name: string;
    tenant: TenantType;
    description: string;
    channels: ChannelType[]
}