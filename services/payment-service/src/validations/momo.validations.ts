import Joi from "joi";

export function validateSetupMomoMethodRequest(payload: any) {
    const schema = Joi.object({
        phone: Joi.string().required(),
        provider: Joi.string().valid('mtn', 'vod', 'atl').required(),
    });
    return schema.validate(payload);
}

export function validateCreateMomoMethodRequest(payload: any) {
    const schema = Joi.object({
        otp: Joi.string().required(),
        method_id: Joi.string().required(),
    });
    return schema.validate(payload);
}

export function validateCreateMomoPaymentRequest(payload: any) {
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        currency: Joi.string().length(3).required(),
        entity: Joi.string().valid('order').required(),
        entity_id: Joi.string().required(),
        phone: Joi.string().optional(),
        provider: Joi.string().valid('mtn', 'vod', 'atl').optional(),
        payment_method_id: Joi.string().optional()
    });

    return schema.validate(payload);
}

export function validateSubmitMomoPaymentOtp(payload: any) {
    const schema = Joi.object({
        otp: Joi.string().required(),
        reference: Joi.string().required(),
    });
    
    return schema.validate(payload);
}


