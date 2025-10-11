import { DomainModule } from '@refresh/domain/module'
import { ExpressModule } from '@refresh/framework/express'
import { InfrastructureModule } from '@refresh/infrastructure/module'
import { CustomerStoreController } from './store/customer-store.controller'

export const CustomerApiModule = ExpressModule.create()
CustomerApiModule.useController(CustomerStoreController)
CustomerApiModule.useModule(InfrastructureModule)
CustomerApiModule.useModule(DomainModule)