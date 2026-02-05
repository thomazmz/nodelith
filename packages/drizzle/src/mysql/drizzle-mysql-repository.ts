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

  protected static createOne = <E extends CoreEntity>(database: MySql2Database, table: DrizzleMysqlTable) => async (entries: CoreEntity.Entries): Promise<DrizzleMysqlTable['$inferSelect']> => {
    const [ response ] = await database.insert(table).values(entries).execute()
    return DrizzleMysqlRepository.getOneById(database, table)(response.insertId)
  }

  protected static updateOneById = (database: MySql2Database, table: DrizzleMysqlTable) => async (id: string | number, properties: Partial<CoreEntity.Entries>): Promise<DrizzleMysqlTable['$inferSelect']> => {
    await database.update(table).set(properties).where(eq(getTableColumns(table).id, Number(id))).execute()
    return DrizzleMysqlRepository.getOneById(database, table)(id)
  }

  protected static updateOneByQuery = (database: MySql2Database, table: DrizzleMysqlTable) => async (query: Record<string, unknown>, properties: Partial<CoreEntity.Entries>): Promise<DrizzleMysqlTable['$inferSelect'] | undefined> => {
    throw new Error('Method not implemented')
  }

  protected static deleteOneById = (database: MySql2Database, table: DrizzleMysqlTable) => async (id: string | number): Promise<void> => {
    await database.delete(table).where(eq(getTableColumns(table).id, Number(id))).execute()
  }

  protected static getOneById = (database: MySql2Database, table: DrizzleMysqlTable) => async (id: string | number): Promise<DrizzleMysqlTable['$inferSelect']> => {
    const [ row ] = await database.select().from(table).where(eq(getTableColumns(table).id, Number(id))).limit(1).execute()
    return row
  }

  protected static findAll = (database: MySql2Database, table: DrizzleMysqlTable) => async (): Promise<DrizzleMysqlTable['$inferSelect'][]> => {
    return database.select().from(table).execute()
  }

  protected static findOneById = (database: MySql2Database, table: DrizzleMysqlTable) => async (id: string | number): Promise<DrizzleMysqlTable['$inferSelect'] | undefined> => {
    throw new Error('Method not implemented')
  }

  protected static findByQuery = (database: MySql2Database, table: DrizzleMysqlTable) => async (query: Record<string, unknown>): Promise<DrizzleMysqlTable['$inferSelect'][]> => {
    throw new Error('Method not implemented')
  }

  protected static findOneByQuery = (database: MySql2Database, table: DrizzleMysqlTable) => async (query: Record<string, unknown>): Promise<DrizzleMysqlTable['$inferSelect'] | undefined> => {
    throw new Error('Method not implemented')
  }

  protected abstract mapEntity(row: DrizzleMysqlTable['$inferSelect']): E

  public async createOne(entries: CoreEntity.Entries<E>): Promise<E> {
    const drizzleResult = await DrizzleMysqlRepository.createOne<E>(this.database, this.table)(entries)
    return this.mapEntity(drizzleResult)
  }

  public async updateOneById(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E | undefined> {
    const drizzleResult = await DrizzleMysqlRepository.updateOneById(this.database, this.table)(id, entries)
    return this.mapEntity(drizzleResult)
  }

  public async updateOneByQuery(query: Partial<E>, entries: Partial<CoreEntity.Entries<E>>): Promise<E | undefined> {
    const drizzleResult = await DrizzleMysqlRepository.updateOneByQuery(this.database, this.table)(query, entries)
    return drizzleResult ? this.mapEntity(drizzleResult) : undefined
  }

  public async deleteOneById(id: E['id']): Promise<void> {
    const drizzleResult = await DrizzleMysqlRepository.deleteOneById(this.database, this.table)(id)
  }

  public async getOneById(id: E['id']): Promise<E> {
    const drizzleResult = await DrizzleMysqlRepository.getOneById(this.database, this.table)(id)
    return this.mapEntity(drizzleResult)
  }

  public async findOneById(id: E['id']): Promise<E | undefined> {
    const drizzleResult = await DrizzleMysqlRepository.findOneById(this.database, this.table)(id)
    return drizzleResult ? this.mapEntity(drizzleResult) : undefined
  }

  public async findByQuery(query: Partial<E>): Promise<E[]> {
    const drizzleResult = await DrizzleMysqlRepository.findByQuery(this.database, this.table)(query as any)
    return drizzleResult.map((singleResult) => this.mapEntity(singleResult))
  }

  public async findOneByQuery(query: Partial<E>): Promise<E | undefined> {
    const drizzleResult = await DrizzleMysqlRepository.findOneByQuery(this.database, this.table)(query as any)
    return drizzleResult ? this.mapEntity(drizzleResult) : undefined
  }

  public async findAll(): Promise<E[]> {
    const drizzleResult = await  DrizzleMysqlRepository.findAll(this.database, this.table)()
    return drizzleResult.map(singleResult => this.mapEntity(singleResult))
  }
}
