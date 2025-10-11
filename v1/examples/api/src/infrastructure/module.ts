import * as Mongodb from '@nodelith/mongodb'
import * as Injection from '@nodelith/container'
import * as Repositories from './repositories'

export const Module = new Injection.Module()

Module.registerConstructor('petRepository', Repositories.MongodbPetRepository)

Module.useInitializer(Mongodb.Initializer)