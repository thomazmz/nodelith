import { ConfigInitializer } from '@nodelith/config'
import { ConfigProfile } from '@nodelith/config'

export type PostgresConfig = {
  connectionLimit: number
  database: string
  password: string
  host: string
  port: number
  user: string
}

export class PostgresConfigInitializer extends ConfigInitializer<PostgresConfig> {
  protected readonly profile = Object.freeze({
    host: ConfigProfile.string('REFRESH_POSTGRES_HOST', 'localhost'),
    port: ConfigProfile.number('REFRESH_POSTGRES_PORT', 5432),
    user: ConfigProfile.string('REFRESH_POSTGRES_USER', 'admin'),
    password: ConfigProfile.string('REFRESH_POSTGRES_PASSWORD', 'admin'),
    database: ConfigProfile.string('REFRESH_POSTGRES_DATABASE', 'refresh-database'),
    connectionLimit: ConfigProfile.number('REFRESH_POSTGRES_POOL_SIZE', 10),
  })
}

