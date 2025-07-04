import Joi, { ValidationResult } from 'joi';
import { NotificationUserData } from '../entities/notifications';
import { NotificationMessage } from '../consumers/messages';
import { channel } from 'diagnostics_channel';

/**
 * Validates the request payload for sending a notification.
 * 
 * @param payload - The request payload to validate.
 * @returns The validation result.
 */
export const validateSendNotificationRequest = (payload: object): ValidationResult<NotificationMessage> => {    
    const schema = Joi.object({
        metadata: Joi.object({
            messageId: Joi.string().required(),
            timestamp: Joi.number().required(),
            priority: Joi.number().optional(),
        }).required(),
        user: Joi.object({
            uid: Joi.string().required(),
            email: Joi.string().email().optional(),
            phone_number: Joi.string().optional(),
        }),
        channels: Joi.object({
            email: Joi.object({
                    title: Joi.string().optional(),
                    body: Joi.string().required(),
                }).optional(),
            sms: Joi.object({
                    title: Joi.string().optional(),
                    body: Joi.string().required(),
                }).optional(),
            push: Joi.object({
                    title: Joi.string().optional(),
                    body: Joi.string().required(),
                    data: Joi.object().pattern(Joi.string(), Joi.string()).optional()
                }).optional()
        }).required().min(1)
    });

    return schema.validate(payload);
}

const allowedChannelTypes = ['email', 'push', 'sms'];
const allowedTenants = ['cli', 'bus', 'muv'];

/**
 * Validates the request payload for updating user information.
 * 
 * @param payload - The request payload to validate.
 * @returns The validation result.
 */
export const validateUpdatePreferenceChannelRequest = (payload: object) => {
    const schema = Joi.object({
        type: Joi.string().valid(...allowedChannelTypes).required(),
        status: Joi.boolean().required()
    });

    return schema.validate(payload);
}

/**
 * Validates the request payload for updating user information.
 * 
 * @param payload - The request payload to validate.
 * @returns The validation result.
 */
export const validateCreateTopicRequest = (payload: object) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    tenant: Joi.string().valid(...allowedTenants),
    channels: Joi.array()
      .items(Joi.string().valid(...allowedChannelTypes))
      .required()
      .min(1)
  });

  return schema.validate(payload);
};

/**
 * Validates the request payload for updating user information.
 * 
 * @param payload - The request payload to validate.
 * @returns The validation result.
 */
export const validateUpdateTopicRequest = (payload: object) => {
    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().required(),
      tenant: Joi.string().valid(...allowedTenants),
      channels: Joi.array()
        .items(Joi.string().valid(...allowedChannelTypes))
        .required()
        .min(1)
    });
  
    return schema.validate(payload);
};

export const validateUserDataRequest = (payload: object) => {
    const schema = Joi.object({
        tenant: Joi.string().valid(...allowedTenants).required(),
        email: Joi.string().email().optional(),
        phone_number: Joi.string().optional(),
        device_token: Joi.string().trim().min(10).optional(),
    });
  
    return schema.validate(payload);
};

export const validateCreateUserPreferencesEvent = (payload: object) => {
    const schema = Joi.object({
      uid: Joi.string().trim().min(10).required(),
      role: Joi.string().valid(...['cli', 'muv', 'bus']).required()
    });
  
    return schema.validate(payload);
};