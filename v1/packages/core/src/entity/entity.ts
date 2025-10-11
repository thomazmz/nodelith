
import { ValueObject } from '@nodelith/types'
import { Identifiable, Identifier } from '../identifiable'

export type Entity<I extends Identifier = string> = ValueObject & Identifiable<I> & {
  readonly createdAt: Date,
  readonly updatedAt: Date,
}
