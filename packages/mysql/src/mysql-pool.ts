import Mysql from 'mysql2/promise'

import { CoreInitializer } from '@nodelith/core';

import { MysqlConfig } from './mysql-config';

export class MysqlPoolInitializer implements CoreInitializer {
  private readonly mysqlConfigRecord: MysqlConfig

  constructor(mysqlConfigRecord: MysqlConfig) {
    this.mysqlConfigRecord = mysqlConfigRecord
  }

  public async initialize(): Promise<Mysql.Pool> {
    return Mysql.createPool({
      host: this.mysqlConfigRecord.host,
      port: this.mysqlConfigRecord.port,
      user: this.mysqlConfigRecord.user,
      password: this.mysqlConfigRecord.password,
      database: this.mysqlConfigRecord.database,
      connectionLimit: this.mysqlConfigRecord.connectionLimit,
    });
  }
}
