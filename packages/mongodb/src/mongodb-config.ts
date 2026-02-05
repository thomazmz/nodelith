import { ConfigInitializer } from '@nodelith/config'
import { ConfigProfile } from '@nodelith/config'

export type MongodbConfig = {
  database: string,
  password: string,
  host: string,
  port: number,
  user: string,
}

export class MongodbConfigInitializer extends ConfigInitializer<MongodbConfig> {
  protected readonly profile = Object.freeze({
    host: ConfigProfile.string('MONGODB_HOST', 'localhost'),
    port: ConfigProfile.number('MONGODB_PORT', 3306),
    user: ConfigProfile.string('MONGODB_USER', 'admin'),
    password: ConfigProfile.string('MONGODB_PASSWORD', 'admin'),
    database: ConfigProfile.string('MONGODB_DATABASE', 'database'),
  })

  public initialize(): Promise<MongodbConfig> {
    return super.initialize()
  }
}
