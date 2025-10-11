import { DomainModule } from '@refresh/domain/module'
import { ExpressModule } from '@refresh/framework/express'
import { InfrastructureModule } from '@refresh/infrastructure/module'
import { MerchantStoreController } from './store/merchant-store.controller'

export const MerchantApiModule = ExpressModule.create()
MerchantApiModule.useController(MerchantStoreController)
MerchantApiModule.useModule(InfrastructureModule)
MerchantApiModule.useModule(DomainModule)
