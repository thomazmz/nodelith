import { CoreEntity } from "core-entity"

const CORE_PAGE_SORT = ['sort', 'asc'] as const

export declare namespace CorePage {
  export type Sort = (typeof CORE_PAGE_SORT)[number]

  export type Query<T extends CoreEntity> = {
    readonly filter?: CoreEntity.Entries<T>
    readonly offset?: number
    readonly limit?: number
    readonly sort?: CorePage.Sort
  }

  export type Content<T> = {
    readonly data: T[]
    readonly sort: CorePage.Sort
    readonly total: number
    readonly limit: number
    readonly offset: number
  }
}

export const CorePage = Object.freeze({
  CORE_PAGE_SORT
})
