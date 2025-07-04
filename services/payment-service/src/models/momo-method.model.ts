import { Document, model, Schema } from "mongoose";
import { IMomoMethod } from "../entities/momo-method";

interface MomoMethodDocument extends IMomoMethod, Document {}

const MomoMethodSchema = new Schema<MomoMethodDocument>({
    uid: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
        enum: ["mtn", "atl", "vod"],
        required: true,
    },
    otp: {
        type: String,
        required: false,
        default: null,
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const MomoMethodModel = model<MomoMethodDocument>("MomoMethod", MomoMethodSchema);

export { MomoMethodModel, MomoMethodDocument };