import { InjectionModule } from '@nodelith/injection'
import { MysqlModule } from './mysql/mysql.module'

export const InfrastructureModule = InjectionModule.create()
InfrastructureModule.useModule(MysqlModule)