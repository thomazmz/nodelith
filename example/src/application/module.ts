import { InfrastructureModule } from '@nodelith/example/infrastructure'
import { DomainModule } from '@nodelith/example/domain'
import { ExpressModule } from '@nodelith/express'

import { PetController } from './routes/pet.controller'
import { errorHandler } from './handlers/error.handler'

export const ApplicationModule = ExpressModule.create()
ApplicationModule.useErrorHandler(errorHandler)
ApplicationModule.useController(PetController)
ApplicationModule.useModule(InfrastructureModule)
ApplicationModule.useModule(DomainModule)
