import { Pet, PetRepository } from '../../domain'
import * as Mongodb from '@nodelith/mongodb'
import * as Core from '@nodelith/core'

export class MongodbPetRepository extends Mongodb.Repository<Pet> implements PetRepository {
  public static readonly COLLECTION_NAME = 'pet_collection'

  public constructor(mongodb: Core.InitializationResult<Mongodb.Initializer>) {
    super(mongodb.database, MongodbPetRepository.COLLECTION_NAME)
  }
}
