import { ExpressModule } from '@nodelith/express'
import { DomainModule } from '@nodelith/example/domain'
import { PetController } from './routes/pet.controller'

export const ApplicationModule = ExpressModule.create()
ApplicationModule.useController(PetController)
ApplicationModule.useModule(DomainModule)
