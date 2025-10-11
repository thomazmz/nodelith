import { InjectionModule } from '@refresh/framework/injection'
import { MysqlPoolInitializer } from '@refresh/framework/mysql'
import { MysqlConfigInitializer } from '@refresh/framework/mysql'
import { MysqlStoreRepository } from './resources/store.repository'

export const MysqlModule = InjectionModule.create()

MysqlModule.register('mysqlConfig', {
  initializer: MysqlConfigInitializer,
  visibility: 'private',
})

MysqlModule.register('mysqlPool', {
  initializer: MysqlPoolInitializer,
  visibility: 'private',
})

MysqlModule.register('storeRepository', {
  class: MysqlStoreRepository,
  visibility: 'public',
  lifecycle: 'scoped',
})
