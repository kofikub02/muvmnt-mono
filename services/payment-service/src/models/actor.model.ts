import { Schema, model, Document } from "mongoose";
import { IActor } from "../entities/actor";

export type ActorDocument = IActor & Document;

const ActorSchema = new Schema<ActorDocument>(
  {
    uid: { type: String, required: true, unique: true },
    credits: { type: Number, default: 0 },
    stripeCustomerId: { type: String },
    paypalCustomerId: { type: String },
  },
  {
    timestamps: true,
  }
);



export const ActorModel = model<ActorDocument>("Actor", ActorSchema);