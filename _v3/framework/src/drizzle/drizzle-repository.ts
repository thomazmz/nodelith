
import { Pool } from 'mysql2/promise'
import { eq, getTableColumns } from 'drizzle-orm'
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2'

import { CoreEntity } from '@refresh/framework/core'
import { CoreRepository } from '@refresh/framework/core'

import { DrizzleRepositoryTable } from './drizzle-repository-table'

export abstract class DrizzleRepository<E extends CoreEntity, T extends DrizzleRepositoryTable<E>> implements CoreRepository<E> {
  protected readonly database: MySql2Database
  protected readonly table: T

  public constructor(mysqlPool: Pool, mysqlTable: T) {
    this.database = drizzle(mysqlPool)
    this.table = mysqlTable
  }

  protected static create = <E extends CoreEntity>(database: MySql2Database, table: DrizzleRepositoryTable) => async (entries: CoreEntity.Entries): Promise<DrizzleRepositoryTable['$inferSelect']> => {
    const [ response ] = await database.insert(table).values(entries).execute()
    return DrizzleRepository.getById(database, table)(response.insertId)
  }

  protected static update = (database: MySql2Database, table: DrizzleRepositoryTable) => async (id: string | number, properties: Partial<CoreEntity.Entries>): Promise<DrizzleRepositoryTable['$inferSelect']> => {
    await database.update(table).set(properties).where(eq(getTableColumns(table).id, Number(id))).execute()
    return DrizzleRepository.getById(database, table)(id)
  }

  protected static delete = (database: MySql2Database, table: DrizzleRepositoryTable) => async (id: string | number): Promise<void> => {
    await database.delete(table).where(eq(getTableColumns(table).id, Number(id))).execute()
  }

  protected static getById = (database: MySql2Database, table: DrizzleRepositoryTable) => async (id: string | number): Promise<DrizzleRepositoryTable['$inferSelect']> => {
    const [ row ] = await database.select().from(table).where(eq(getTableColumns(table).id, Number(id))).limit(1).execute()
    return row
  }

  protected static getAll  = (database: MySql2Database, table: DrizzleRepositoryTable) => async (): Promise<DrizzleRepositoryTable['$inferSelect'][]> => {
    return database.select().from(table).execute()
  }

  protected abstract mapEntity(row: DrizzleRepositoryTable['$inferSelect']): E

  public async create(entries: CoreEntity.Entries<E>): Promise<E> {
    const drizzleResult = await DrizzleRepository.create<E>(this.database, this.table)(entries)
    return this.mapEntity(drizzleResult)
  }

  public async update(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E> {
    const drizzleResult = await DrizzleRepository.update(this.database, this.table)(id, entries)
    return this.mapEntity(drizzleResult)
  }

  public async delete(id: E['id']): Promise<void> {
    const drizzleResult = await DrizzleRepository.delete(this.database, this.table)(id)
  }

  public async getById(id: E['id']): Promise<E> {
    const drizzleResult = await DrizzleRepository.getById(this.database, this.table)(id)
    return this.mapEntity(drizzleResult)
  }

  public async getAll(): Promise<E[]> {
    const drizzleResult = await  DrizzleRepository.getAll(this.database, this.table)()
    return drizzleResult.map(singleResult => this.mapEntity(singleResult))
  }
}
