import { Pool } from 'pg'

import { CoreInitializer } from '@nodelith/core'

import { PostgresConfig } from './postgres-config'

export class PostgresPoolInitializer implements CoreInitializer {
  private readonly postgresConfigRecord: PostgresConfig

  constructor(postgresConfigRecord: PostgresConfig) {
    this.postgresConfigRecord = postgresConfigRecord
  }

  public async initialize(): Promise<Pool> {
    return new Pool({
      host: this.postgresConfigRecord.host,
      port: this.postgresConfigRecord.port,
      user: this.postgresConfigRecord.user,
      password: this.postgresConfigRecord.password,
      database: this.postgresConfigRecord.database,
      max: this.postgresConfigRecord.connectionLimit,
    })
  }
}
