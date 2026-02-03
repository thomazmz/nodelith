import { Pool } from 'pg'
import { eq, getTableColumns } from 'drizzle-orm'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'

import { CoreEntity } from '@nodelith/core'
import { CoreRepository } from '@nodelith/core'

import { DrizzlePostgresTable } from './drizzle-postgres-table'

export abstract class DrizzlePostgresRepository<E extends CoreEntity, T extends DrizzlePostgresTable<E>> implements CoreRepository<E> {
  protected readonly database: NodePgDatabase
  protected readonly table: T

  public constructor(postgresPool: Pool, postgresTable: T) {
    this.database = drizzle(postgresPool)
    this.table = postgresTable
  }

  protected static createOne = <E extends CoreEntity>(database: NodePgDatabase, table: DrizzlePostgresTable) => async (entries: CoreEntity.Entries): Promise<DrizzlePostgresTable['$inferSelect']> => {
    const [ row ] = await database.insert(table).values(entries).returning().execute()
    return row
  }

  protected static updateOneById = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (id: string | number, properties: Partial<CoreEntity.Entries>): Promise<DrizzlePostgresTable['$inferSelect']> => {
    const [ row ] = await database.update(table).set(properties).where(eq(getTableColumns(table).id, id)).returning().execute()
    return row
  }

  protected static deleteOneById = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (id: string | number): Promise<void> => {
    await database.delete(table).where(eq(getTableColumns(table).id, id)).execute()
  }

  protected static getOneById = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (id: string | number): Promise<DrizzlePostgresTable['$inferSelect']> => {
    const [ row ] = await database.select().from(table).where(eq(getTableColumns(table).id, id)).limit(1).execute()
    return row
  }

  protected static findAll = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (): Promise<DrizzlePostgresTable['$inferSelect'][]> => {
    return database.select().from(table).execute()
  }

  protected static findOneById = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (id: string | number): Promise<DrizzlePostgresTable['$inferSelect'] | undefined> => {
    throw new Error('Method not implemented')
  }

  protected static findByQuery = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (query: Record<string, unknown>): Promise<DrizzlePostgresTable['$inferSelect'][]> => {
    throw new Error('Method not implemented')
  }

  protected static findOneByQuery = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (query: Record<string, unknown>): Promise<DrizzlePostgresTable['$inferSelect'] | undefined> => {
    throw new Error('Method not implemented')
  }

  protected abstract mapEntity(row: DrizzlePostgresTable['$inferSelect']): E

  public async createOne(entries: CoreEntity.Entries<E>): Promise<E> {
    const drizzleResult = await DrizzlePostgresRepository.createOne<E>(this.database, this.table)(entries)
    return this.mapEntity(drizzleResult)
  }

  public async updateOneById(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E> {
    const drizzleResult = await DrizzlePostgresRepository.updateOneById(this.database, this.table)(id, entries)
    return this.mapEntity(drizzleResult)
  }

  public async deleteOneById(id: E['id']): Promise<void> {
    await DrizzlePostgresRepository.deleteOneById(this.database, this.table)(id)
  }

  public async getOneById(id: E['id']): Promise<E> {
    const drizzleResult = await DrizzlePostgresRepository.getOneById(this.database, this.table)(id)
    return this.mapEntity(drizzleResult)
  }

  public async findOneById(id: E['id']): Promise<E | undefined> {
    const drizzleResult = await DrizzlePostgresRepository.findOneById(this.database, this.table)(id)
    return drizzleResult ? this.mapEntity(drizzleResult) : undefined
  }

  public async findByQuery(query: Partial<E>): Promise<E[]> {
    const drizzleResult = await DrizzlePostgresRepository.findByQuery(this.database, this.table)(query as any)
    return drizzleResult.map((singleResult) => this.mapEntity(singleResult))
  }

  public async findOneByQuery(query: Partial<E>): Promise<E | undefined> {
    const drizzleResult = await DrizzlePostgresRepository.findOneByQuery(this.database, this.table)(query as any)
    return drizzleResult ? this.mapEntity(drizzleResult) : undefined
  }

  public async findAll(): Promise<E[]> {
    const drizzleResult = await DrizzlePostgresRepository.findAll(this.database, this.table)()
    return drizzleResult.map((singleResult) => this.mapEntity(singleResult))
  }
}
