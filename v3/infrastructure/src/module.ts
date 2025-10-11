import { InjectionModule } from '@refresh/framework/injection'
import { MysqlModule } from '@refresh/infrastructure/mysql'
export const InfrastructureModule = InjectionModule.create()
InfrastructureModule.useModule(MysqlModule)