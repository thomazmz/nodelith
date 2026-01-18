import Mysql from 'mysql2/promise'
import { CoreInitializer } from '@nodelith/core';
import { MysqlConfig } from './mysql-config';

export class MysqlPoolInitializer implements CoreInitializer {
  private readonly mysqlConfig: MysqlConfig

  constructor(mysqlConfig: MysqlConfig) {
    this.mysqlConfig = mysqlConfig
  }

  public async initialize(): Promise<Mysql.Pool> {
    return Mysql.createPool({
      host: this.mysqlConfig.host,
      port: this.mysqlConfig.port,
      user: this.mysqlConfig.user,
      password: this.mysqlConfig.password,
      database: this.mysqlConfig.database,
      connectionLimit: this.mysqlConfig.connectionLimit,
    });
  }
}
