/**
 * Enum representing an User Notification Preference in the system.
 */
export enum ChannelType {
    EMAIL = 'email',
    SMS = 'sms',
    PUSH = 'push'
}

/**
 * Enum representing an User Notification Preference in the system.
 */
export enum TenantType {
    CLI = 'cli',
    BUS = 'bus',
    MUV = 'muv'
}

/**
 * Interface representing an User Notification Preference in the system.
 */
export interface IChannel {
    type: ChannelType;
    status: boolean;
}