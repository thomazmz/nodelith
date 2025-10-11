
import { InjectionModule } from '@refresh/framework/injection'
import { StoreConfigInitializer } from './store.config'
import { StoreService } from './store.service'

export const StoreModule = InjectionModule.create()

StoreModule.register('storeConfig', {
  initializer: StoreConfigInitializer,
  visibility: 'private',
})

StoreModule.register('storeService', {
  class: StoreService,
  visibility: 'public',
  lifecycle: 'scoped',
})
