import Joi from 'joi';

const addressSchema = Joi.object({
    label: Joi.string().required(),
    building_name: Joi.string().allow('').optional(),
    apartment_suite: Joi.string().allow('').optional(),
    entry_code: Joi.string().allow('').optional(),
    instructions: Joi.string().allow('').optional(),
    icon: Joi.string().allow('').optional(),
    description: Joi.string().required(),
    main_text: Joi.string().required(), 
    secondary_text: Joi.string().required(),
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
});

export const validateCreateAddressRequest = (data: any) => {
    return addressSchema.validate(data);
};


export const validateUpdateAddressRequest = (data: any) => {
    return addressSchema.validate(data);
};