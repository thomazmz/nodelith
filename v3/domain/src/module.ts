import { InjectionModule } from '@refresh/framework/injection'
import { StoreModule } from './store/store.module'

export const DomainModule = InjectionModule.create()
DomainModule.useModule(StoreModule)
