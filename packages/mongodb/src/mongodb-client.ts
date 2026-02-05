import { MongoClient } from 'mongodb'
import { CoreInitializer, CoreIssue } from '@nodelith/core'
import { MongodbConfig } from './mongodb-config'

export class MongodbClientInitializer implements CoreInitializer {
  private readonly mongodbConfig: MongodbConfig

  constructor(mongodbConfig: MongodbConfig) {
    this.mongodbConfig = mongodbConfig
  }

  public async initialize(): Promise<MongoClient> {
    const address = `${this.mongodbConfig.host}:${this.mongodbConfig.port}`

    const credentials = `${this.mongodbConfig.user}:${this.mongodbConfig.password}` 

    const connectionString = `mongodb://${credentials}@${address}`

    const client = new MongoClient(connectionString)

    return await client.connect()
  }
}
