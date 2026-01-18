import { ConfigInitializer } from '@nodelith/config'
import { ConfigProfile } from '@nodelith/config'

export type MysqlConfig = {
  connectionLimit: number,
  database: string,
  password: string,
  host: string,
  port: number,
  user: string,
}

export class MysqlConfigInitializer extends ConfigInitializer<MysqlConfig> {
  protected readonly profile = Object.freeze({
    host: ConfigProfile.string('REFRESH_MYSQL_HOST', 'localhost'),
    port: ConfigProfile.number('REFRESH_MYSQL_PORT', 3306),
    user: ConfigProfile.string('REFRESH_MYSQL_USER', 'admin'),
    password: ConfigProfile.string('REFRESH_MYSQL_PASSWORD', 'admin'),
    database: ConfigProfile.string('REFRESH_MYSQL_DATABASE', 'refresh-database'),
    connectionLimit: ConfigProfile.number('REFRESH_MYSQL_POOL_SIZE', 10),
  })
}