import { Core } from '@refresh/framework/core'

export type MysqlConfig = Core.Config<InstanceType<typeof MysqlConfigInitializer>['profile']>

export class MysqlConfigInitializer extends Core.ConfigInitializer {
  protected readonly profile = Core.Config.profile({
    host: Core.Config.string('REFRESH_MYSQL_HOST', 'localhost'),
    port: Core.Config.number('REFRESH_MYSQL_PORT', 3306),
    user: Core.Config.string('REFRESH_MYSQL_USER', 'admin'),
    password: Core.Config.string('REFRESH_MYSQL_PASSWORD', 'admin'),
    database: Core.Config.string('REFRESH_MYSQL_DATABASE', 'refresh-database'),
    connectionLimit: Core.Config.number('REFRESH_MYSQL_POOL_SIZE', 10),
  })
}