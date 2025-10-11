import { MySqlColumn } from "drizzle-orm/mysql-core"
import { AnyMySqlTable } from "drizzle-orm/mysql-core"
import { CoreEntity } from '@refresh/framework/core'


export type DrizzleRepositoryTable<E extends CoreEntity = CoreEntity> = AnyMySqlTable<{
  columns: 
    & { [k in keyof Omit<E, keyof CoreEntity.Base>]: MySqlColumn }
    & {
    id: MySqlColumn<{
      name: "id"
      tableName: string
      dataType: "number"
      columnType: "MySqlBigInt53"
      data: number
      driverParam: string | number
      notNull: true
      hasDefault: true
      isPrimaryKey: true
      isAutoincrement: true
      hasRuntimeDefault: false
      enumValues: undefined
      baseColumn: never
      identity: undefined
      generated: undefined
    }>
    createdAt: MySqlColumn<{
      name: "created_at"
      tableName: string
      dataType: "date"
      columnType: "MySqlTimestamp"
      data: Date
      driverParam: string | number
      notNull: true
      hasDefault: true
      isPrimaryKey: false
      isAutoincrement: false
      hasRuntimeDefault: false
      enumValues: undefined
      baseColumn: never
      identity: undefined
      generated: undefined
    }>,
    updatedAt: MySqlColumn<{
      name: "updated_at"
      tableName: string
      dataType: "date"
      columnType: "MySqlTimestamp"
      data: Date
      driverParam: string | number
      notNull: true
      hasDefault: true
      isPrimaryKey: false
      isAutoincrement: false
      hasRuntimeDefault: false
      enumValues: undefined
      baseColumn: never
      identity: undefined
      generated: undefined
    }>
  }
}>
