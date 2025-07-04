import { ActorDocument, ActorModel } from '../models/actor.model';
import { BaseMongoDBRepository } from '@repo/lib';

/**
 * Actor repository in the service.
 */
export class ActorsRepository extends BaseMongoDBRepository<ActorDocument, typeof ActorModel> {
  constructor() {
    super(ActorModel);
  }
}

