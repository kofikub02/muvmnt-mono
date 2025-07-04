import { AddressDocument, AddressModel } from "../models/address.model";
import { BaseRepository } from "./base";

/**
 * Saved Addresses repository in the service.
 */
export class AddressesRepository extends BaseRepository<AddressDocument, typeof AddressModel> {
  constructor() {
    super(AddressModel);
  }
}