import { Pool } from 'mysql2/promise'
import { DrizzleMysqlRepository } from '@nodelith/drizzle/mysql'
import { PetRepository } from '@nodelith/example/domain'
import { PetEntity } from '@nodelith/example/domain'
import { PetTable } from './mysql-pet.table'

export class MysqlPetRepository extends DrizzleMysqlRepository<PetEntity, typeof PetTable> implements PetRepository {
  public constructor(mysqlPool: Pool) {
    super(mysqlPool, PetTable)
  }

  protected mapEntity(row: (typeof PetTable)['$inferSelect']): PetEntity {
    return {
      id: String(row.id),
      age: row.age,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    }
  }
}