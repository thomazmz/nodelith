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
    host: ConfigProfile.string('POSTGRES_HOST', 'localhost'),
    port: ConfigProfile.number('POSTGRES_PORT', 5432),
    user: ConfigProfile.string('POSTGRES_USER', 'admin'),
    password: ConfigProfile.string('POSTGRES_PASSWORD', 'admin'),
    database: ConfigProfile.string('POSTGRES_DATABASE', 'database'),
    connectionLimit: ConfigProfile.number('POSTGRES_POOL_SIZE', 10),
  })
}

