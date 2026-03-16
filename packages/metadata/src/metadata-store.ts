import { CoreNullable } from '@nodelith/core'
import { Patch } from '@nodelith/utilities'
import { MetadataProperties } from './metadata-properties'
import { MetadataKey } from './metadata-key'

export type MetadataStore<T extends CoreNullable.Struct = CoreNullable.Struct> = Readonly<{
  readonly extract: (target: object) => Patch<T>
  readonly append: (target: object, patch: Patch<T>) => Patch<T>
  readonly clear: (target: object) => void
}>

function createMetadataStore<T extends CoreNullable.Struct>(key: symbol): MetadataStore<T>
function createMetadataStore<T extends CoreNullable.Struct>(name: string): MetadataStore<T>
function createMetadataStore<T extends CoreNullable.Struct>(keyOrName: string | symbol): MetadataStore<T> {
  const key = typeof keyOrName === 'string'
    ? MetadataKey.create<T>(keyOrName)
    : keyOrName

  return Object.freeze({
    extract(target: object) {
      return MetadataProperties.extract<T>(target, key)
    },
    append(target: object, patch: Patch<T>) {
      return MetadataProperties.append<T>(target, key, patch)
    },
    clear(target: object) {
      return MetadataProperties.clear<T>(target, key)
    },
  })
}

export const MetadataStore = Object.freeze({
  create: createMetadataStore,
})
