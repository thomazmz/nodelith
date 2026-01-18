import { Pool } from 'pg'
import { eq, getTableColumns } from 'drizzle-orm'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'

import { CoreEntity } from '@nodelith/core'
import { CoreRepository } from '@nodelith/core'

import { DrizzlePostgresTable } from './drizzle-postgres-table'

export abstract class DrizzlePostgresRepository<E extends CoreEntity, T extends DrizzlePostgresTable<E>> implements CoreRepository<E> {
  protected readonly database: NodePgDatabase
  protected readonly table: T

  public constructor(pgPool: Pool, pgTable: T) {
    this.database = drizzle(pgPool)
    this.table = pgTable
  }

  protected static create = <E extends CoreEntity>(database: NodePgDatabase, table: DrizzlePostgresTable) => async (entries: CoreEntity.Entries): Promise<DrizzlePostgresTable['$inferSelect']> => {
    const [ row ] = await database.insert(table).values(entries).returning().execute()
    return row
  }

  protected static update = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (id: string | number, properties: Partial<CoreEntity.Entries>): Promise<DrizzlePostgresTable['$inferSelect']> => {
    const [ row ] = await database.update(table).set(properties).where(eq(getTableColumns(table).id, id)).returning().execute()
    return row
  }

  protected static delete = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (id: string | number): Promise<void> => {
    await database.delete(table).where(eq(getTableColumns(table).id, id)).execute()
  }

  protected static getById = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (id: string | number): Promise<DrizzlePostgresTable['$inferSelect']> => {
    const [ row ] = await database.select().from(table).where(eq(getTableColumns(table).id, id)).limit(1).execute()
    return row
  }

  protected static getAll = (database: NodePgDatabase, table: DrizzlePostgresTable) => async (): Promise<DrizzlePostgresTable['$inferSelect'][]> => {
    return database.select().from(table).execute()
  }

  protected abstract mapEntity(row: DrizzlePostgresTable['$inferSelect']): E

  public async create(entries: CoreEntity.Entries<E>): Promise<E> {
    const drizzleResult = await DrizzlePostgresRepository.create<E>(this.database, this.table)(entries)
    return this.mapEntity(drizzleResult)
  }

  public async update(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E> {
    const drizzleResult = await DrizzlePostgresRepository.update(this.database, this.table)(id, entries)
    return this.mapEntity(drizzleResult)
  }

  public async delete(id: E['id']): Promise<void> {
    await DrizzlePostgresRepository.delete(this.database, this.table)(id)
  }

  public async getById(id: E['id']): Promise<E> {
    const drizzleResult = await DrizzlePostgresRepository.getById(this.database, this.table)(id)
    return this.mapEntity(drizzleResult)
  }

  public async getAll(): Promise<E[]> {
    const drizzleResult = await DrizzlePostgresRepository.getAll(this.database, this.table)()
    return drizzleResult.map((singleResult) => this.mapEntity(singleResult))
  }
}

