import { mysqlTable } from 'drizzle-orm/mysql-core'
import { timestamp } from 'drizzle-orm/mysql-core'
import { varchar } from 'drizzle-orm/mysql-core'
import { bigint } from 'drizzle-orm/mysql-core'
import { int } from 'drizzle-orm/mysql-core'

export const PetTable = mysqlTable('pet', {
  id: bigint('id', { mode: 'number' }).notNull().primaryKey().autoincrement(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  name: varchar('name', { length: 255 }).notNull(),
  age: int('age').notNull(),
})
