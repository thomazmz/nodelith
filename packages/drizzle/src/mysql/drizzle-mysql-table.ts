import { AnyMySqlTable } from 'drizzle-orm/mysql-core'
import { MySqlColumn } from 'drizzle-orm/mysql-core'

import { CoreEntity } from '@nodelith/core'

export type DrizzleMysqlTable<E extends CoreEntity = CoreEntity> = AnyMySqlTable<{
  columns:
    & { [k in keyof Omit<E, keyof CoreEntity.Base>]: MySqlColumn }
    & {
      id: MySqlColumn
      createdAt: MySqlColumn
      updatedAt: MySqlColumn
    }
}>
