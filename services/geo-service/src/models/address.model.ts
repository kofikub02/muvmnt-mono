import { model, Model, Schema, Document } from "mongoose";
import { IAddress } from "../entities/address";

export interface AddressDocument extends IAddress, Document {}

/**
 * Schema representing a Place in the system.
 */
const AddressSchema = new Schema<AddressDocument>(
    {
        uid: { type: String, required: true },
        icon: String,
        label: { type: String, required: true },
        building_name: String,
        apartment_suite: String,
        entry_code: String,
        instructions: String,
        description: { type: String, required: true },
        main_text: { type: String, required: true },
        secondary_text: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    { timestamps: true }
);


/**
 * Entity representing a Saved Address in the system.
 */
const AddressModel: Model<AddressDocument> = model<AddressDocument>('Address', AddressSchema);

export { AddressModel }