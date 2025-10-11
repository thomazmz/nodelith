import { Entity } from './entity'
import { EntityProperties } from './entity-properties'
import { Identifier } from '../identifiable'

export type EntityPropertiesToUpdate<E extends Entity<Identifier>> = {
  [Key in keyof EntityProperties<E> as E[Key] extends Required<E>[Key] ? never : Key]?: E[Key] | undefined | null
} & {
  [Key in keyof EntityProperties<E> as E[Key] extends Required<E>[Key] ? Key : never]?: E[Key]
}
