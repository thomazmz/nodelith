import { Initializer } from '@nodelith/context';
import { RedisConfig } from './redis-config'
import { RedisClientType, createClient } from 'redis'

export class RedisInitializer implements Initializer {
  private redisClient?: RedisClientType

  public constructor(
    private readonly redisConfig: RedisConfig
  ) {}

  private getConnectionUrl() {
    const host = this.redisConfig.host
    const port = this.redisConfig.port
    const username = this.redisConfig.username
    const password = this.redisConfig.password

    if(username && password) {
      return `redis://${username}:${password}@${host}:${port}`
    }

    return `redis://${host}:${port}`
  }

  public async initialize() {
    const url = this.getConnectionUrl()

    this.redisClient = createClient({ url })

    this.redisClient.connect()

    this.redisClient

    return { 
      redisClient: this.redisClient
    }
  }

  public async terminate(): Promise<void> {
    return this.redisClient?.disconnect()
  }
}