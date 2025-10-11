import Mysql from 'mysql2/promise'
import { Core } from '@refresh/framework/core'
import { MysqlConfig } from './mysql-config-initializer';

export class MysqlPoolInitializer implements Core.Initializer {
  private readonly mysqlConfig: MysqlConfig

  private pool?: Mysql.Pool | undefined

  constructor(mysqlConfig: MysqlConfig) {
    this.mysqlConfig = mysqlConfig
  }

  public async initialize(): Promise<Mysql.Pool> {
    return this.pool = Mysql.createPool({
      host: this.mysqlConfig.host,
      port: this.mysqlConfig.port,
      user: this.mysqlConfig.user,
      password: this.mysqlConfig.password,
      database: this.mysqlConfig.database,
      connectionLimit: this.mysqlConfig.connectionLimit,
    });
  }

  public async terminate(): Promise<void> {
    await this.pool?.end()
  }
}
