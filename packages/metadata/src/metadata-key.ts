import { CoreNullable } from '@nodelith/core'

export type MetadataKey<T extends CoreNullable.Struct = CoreNullable.Struct> = symbol & {
  readonly __metadata__?: T
}

export const MetadataKey = Object.freeze({
  create<T extends CoreNullable.Struct>(name: string): MetadataKey<T> {
    return Symbol(name) as MetadataKey<T>
  }
})
