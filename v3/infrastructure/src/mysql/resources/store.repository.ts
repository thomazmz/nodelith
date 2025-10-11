import { Pool } from 'mysql2/promise'
import { StoreEntity } from '@refresh/domain/store'
import { StoreRepository } from '@refresh/domain/store'
import { DrizzleRepository } from '@refresh/framework/drizzle'
import { StoreTable } from './store.table'

export class MysqlStoreRepository extends DrizzleRepository<StoreEntity, typeof StoreTable> implements StoreRepository {
  public constructor(mysqlPool: Pool) {
    super(mysqlPool, StoreTable)
  }

  protected mapEntity(row: (typeof StoreTable)['$inferSelect']): StoreEntity {
    return {
      id: String(row.id),
      name: row.name,
      slug: row.slug,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    }
  }
}