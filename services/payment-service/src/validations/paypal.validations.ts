import Joi from "joi";

export function validateCreatePaymentToken(payload: any) {
    const schema = Joi.object({
        setupTokenId: Joi.string().required()
    });
    return schema.validate(payload);
}

export function validateCreatePaypalPaymentRequest(payload: any) {
    const schema = Joi.object({
        amount: Joi.number().positive().required(),
        currency: Joi.string().length(3).required(),
        entity: Joi.string().valid('order').required(),
        entity_id: Joi.string().required(),
        payment_method_id: Joi.string().optional(),
    });
    
    return schema.validate(payload);
}

