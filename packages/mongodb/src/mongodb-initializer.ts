import * as Mongodb from 'mongodb'
import { Initializer } from '@nodelith/core'
import { MongodbConfig } from './mongodb-config'

export type MongodbInitializationResult = {
  client: Mongodb.MongoClient,
  database: Mongodb.Db,
}

export class MongodbInitializer implements Initializer<MongodbInitializationResult> {
  private readonly client: Mongodb.MongoClient
  private readonly database: Mongodb.Db

  constructor(private readonly mongodbConfig: MongodbConfig) {
    const connectionString = this.mongodbConfig.connectionString
    const connectTimeoutMS = this.mongodbConfig.connectionTimeout
    this.client = new Mongodb.MongoClient(connectionString, { connectTimeoutMS })
    this.database = this.client.db(this.mongodbConfig.databaseName)
  }

  public async initialize(): Promise<MongodbInitializationResult> {
    await this.client.connect()
    return {
      client: this.client,
      database: this.database,
    }
  }

  public async terminate?(): Promise<void> {
    await this.client.close()
  }
}