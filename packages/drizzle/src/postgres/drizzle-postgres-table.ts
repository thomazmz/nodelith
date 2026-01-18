import { AnyPgTable } from 'drizzle-orm/pg-core'
import { PgColumn } from 'drizzle-orm/pg-core'

import { CoreEntity } from '@nodelith/core'

export type DrizzlePostgresTable<E extends CoreEntity = CoreEntity> = AnyPgTable<{
  columns:
    & { [k in keyof Omit<E, keyof CoreEntity.Base>]: PgColumn }
    & {
      id: PgColumn
      createdAt: PgColumn
      updatedAt: PgColumn
    }
}>

