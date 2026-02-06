import { CoreEntity } from "core-entity"

export declare namespace CorePage {
  export type Sort = (
    | 'desc'
    | 'asc'
  )

  export type Query<T extends CoreEntity> = {
    readonly filter?: CoreEntity.Entries<T>
    readonly offset?: number
    readonly limit?: number
    readonly sort: CorePage.Sort
  }

  export type Content<T> = {
    readonly total: number
    readonly data: T[]
  }
}
