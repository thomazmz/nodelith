import { mysqlTable } from 'drizzle-orm/mysql-core'
import { timestamp } from 'drizzle-orm/mysql-core'
import { varchar } from 'drizzle-orm/mysql-core'
import { bigint } from 'drizzle-orm/mysql-core'

export const StoreTable = mysqlTable('stores', {
  id: bigint('id', { mode: 'number' }).notNull().primaryKey().autoincrement(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
})
