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
    host: ConfigProfile.string('MYSQL_HOST', 'localhost'),
    port: ConfigProfile.number('MYSQL_PORT', 3306),
    user: ConfigProfile.string('MYSQL_USER', 'admin'),
    password: ConfigProfile.string('MYSQL_PASSWORD', 'admin'),
    database: ConfigProfile.string('MYSQL_DATABASE', 'database'),
    connectionLimit: ConfigProfile.number('MYSQL_POOL_SIZE', 10),
  })
}