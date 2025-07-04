import { Schema } from "mongoose";
import { ChannelType, IChannel } from "../entities/base";

export const ChannelSchema = new Schema<IChannel>(
    {
      type: {
        type: String,
        enum: Object.values(ChannelType),
        required: true,
      },
      status: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
    { _id: false }
);