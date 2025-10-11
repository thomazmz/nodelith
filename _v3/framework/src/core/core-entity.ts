import { CoreValue } from './core-value'

export type CoreEntity = (
  & CoreValue.Record
  & CoreEntity.Base
)

export declare namespace CoreEntity {
  export type Entries<E extends CoreEntity = CoreEntity> = (
    Omit<E, keyof CoreEntity.Base>
  )
  
  export type Base = {
    readonly id: string
    readonly createdAt: Date
    readonly updatedAt: Date
  }
}
