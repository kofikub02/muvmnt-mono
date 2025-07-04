import Joi from 'joi';

export const valiateCreatePaymentConsumerRequest = (payload: any) => {
    const schema = Joi.object({});

    return schema.validate(payload);
}