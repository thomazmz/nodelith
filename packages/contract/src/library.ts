import { ArrayContract } from './array'
import { NumberContract } from './number'
import { StringContract } from './string'
import { ObjectContract } from './object'
import { BooleanContract } from './boolean'

import { CoreContract } from '@nodelith/core'

export declare namespace Contract {
  export type Infer<T extends CoreContract> = CoreContract.Infer<T>
}

export const Contract = Object.freeze({
  array: ArrayContract.create,
  number: NumberContract.create,
  string: StringContract.create,
  object: ObjectContract.create,
  boolean: BooleanContract.create,
})