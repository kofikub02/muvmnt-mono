
import { IChannel } from "./base";

/**
 * Interface representing an User Notification Preference in the system.
 */
export interface INotificationPreference {
    uid: string;
    topic: any;
    channels: IChannel[]
}