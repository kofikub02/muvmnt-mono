import { MomoMethodDocument, MomoMethodModel } from "../models/momo-method.model";
import { BaseMongoDBRepository } from "@repo/lib";

export class MomoMethodsRepository extends BaseMongoDBRepository<MomoMethodDocument, typeof MomoMethodModel> {
    constructor() {
        super(MomoMethodModel);
    }
}