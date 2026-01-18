import { Pool } from 'mysql2/promise'
import { eq, getTableColumns } from 'drizzle-orm'
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2'

import { CoreEntity } from '@nodelith/core'
import { CoreRepository } from '@nodelith/core'

import { DrizzleMysqlTable } from './drizzle-mysql-table'

export abstract class DrizzleMysqlRepository<E extends CoreEntity, T extends DrizzleMysqlTable<E>> implements CoreRepository<E> {
  protected readonly database: MySql2Database
  protected readonly table: T

  public constructor(mysqlPool: Pool, mysqlTable: T) {
    this.database = drizzle(mysqlPool)
    this.table = mysqlTable
  }

  protected static create = <E extends CoreEntity>(database: MySql2Database, table: DrizzleMysqlTable) => async (entries: CoreEntity.Entries): Promise<DrizzleMysqlTable['$inferSelect']> => {
    const [ response ] = await database.insert(table).values(entries).execute()
    return DrizzleMysqlRepository.getById(database, table)(response.insertId)
  }

  protected static update = (database: MySql2Database, table: DrizzleMysqlTable) => async (id: string | number, properties: Partial<CoreEntity.Entries>): Promise<DrizzleMysqlTable['$inferSelect']> => {
    await database.update(table).set(properties).where(eq(getTableColumns(table).id, Number(id))).execute()
    return DrizzleMysqlRepository.getById(database, table)(id)
  }

  protected static delete = (database: MySql2Database, table: DrizzleMysqlTable) => async (id: string | number): Promise<void> => {
    await database.delete(table).where(eq(getTableColumns(table).id, Number(id))).execute()
  }

  protected static getById = (database: MySql2Database, table: DrizzleMysqlTable) => async (id: string | number): Promise<DrizzleMysqlTable['$inferSelect']> => {
    const [ row ] = await database.select().from(table).where(eq(getTableColumns(table).id, Number(id))).limit(1).execute()
    return row
  }

  protected static getAll  = (database: MySql2Database, table: DrizzleMysqlTable) => async (): Promise<DrizzleMysqlTable['$inferSelect'][]> => {
    return database.select().from(table).execute()
  }

  protected abstract mapEntity(row: DrizzleMysqlTable['$inferSelect']): E

  public async create(entries: CoreEntity.Entries<E>): Promise<E> {
    const drizzleResult = await DrizzleMysqlRepository.create<E>(this.database, this.table)(entries)
    return this.mapEntity(drizzleResult)
  }

  public async update(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E> {
    const drizzleResult = await DrizzleMysqlRepository.update(this.database, this.table)(id, entries)
    return this.mapEntity(drizzleResult)
  }

  public async delete(id: E['id']): Promise<void> {
    const drizzleResult = await DrizzleMysqlRepository.delete(this.database, this.table)(id)
  }

  public async getById(id: E['id']): Promise<E> {
    const drizzleResult = await DrizzleMysqlRepository.getById(this.database, this.table)(id)
    return this.mapEntity(drizzleResult)
  }

  public async getAll(): Promise<E[]> {
    const drizzleResult = await  DrizzleMysqlRepository.getAll(this.database, this.table)()
    return drizzleResult.map(singleResult => this.mapEntity(singleResult))
  }
}
