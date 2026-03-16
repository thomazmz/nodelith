import { CoreNullable } from '@nodelith/core'
import { Patch } from '@nodelith/utilities'
import { MetadataKey } from './metadata-key'

function extract<T extends CoreNullable.Struct>(target: object, key: MetadataKey<T>): Patch<T>
function extract<T extends CoreNullable.Struct>(target: object, key: symbol): Patch<T>
function extract<T extends CoreNullable.Struct>(target: object, key: symbol): Patch<T> {
  const store = target as Record<symbol, unknown>
  const value = store[key] as Patch<T> | undefined
  if (value === undefined || value === null) {
    return Object.freeze({}) as Patch<T>
  }
  return Object.freeze(value) as Patch<T>
}

function append<T extends CoreNullable.Struct>(target: object, key: MetadataKey<T>, patch: Patch<T>): Patch<T>
function append<T extends CoreNullable.Struct>(target: object, key: symbol, patch: Patch<T>): Patch<T>
function append<T extends CoreNullable.Struct>(target: object, key: symbol, patch: Patch<T>): Patch<T> {
  const store = target as Record<symbol, unknown>
  const current = store[key] as Patch<T> | undefined
  const merged = Patch.merge(current, patch)
  Object.defineProperty(target, key, {
    value: merged,
    enumerable: false,
    writable: true,
    configurable: true,
  })
  return merged
}

function clear<T extends CoreNullable.Struct>(target: object, key: MetadataKey<T>): void
function clear(target: object, key: symbol): void
function clear(target: object, key: symbol): void {
  const store = target as Record<symbol, unknown>
  delete store[key]
}

export const MetadataProperties = Object.freeze({
  extract,
  append,
  clear,
})


