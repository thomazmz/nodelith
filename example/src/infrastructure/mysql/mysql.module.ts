import { InjectionModule } from '@nodelith/injection'
import { MysqlPoolInitializer } from '@nodelith/mysql'
import { MysqlConfigInitializer } from '@nodelith/mysql'
import { MysqlPetRepository } from './resources/mysql-pet.repository'

export const MysqlModule = InjectionModule.create()

MysqlModule.mapClassInitializer('mysqlConfig', MysqlConfigInitializer, {
  visibility: 'private',
})

MysqlModule.mapClassInitializer('mysqlPool', MysqlPoolInitializer, {
  visibility: 'private',
})

MysqlModule.mapClassRegistration('petRepository', MysqlPetRepository, {
  visibility: 'public',
  lifecycle: 'scoped',
})
