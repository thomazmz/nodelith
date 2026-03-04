
import { CoreContract } from '@nodelith/core'

////////////////////////////////////////////////
// Boolean Contract 
import { $Boolean } from './contract-boolean'
function createBooleanContract(): $Boolean<boolean> {
  return $Boolean.create({
    optional: false,
    nullable: false,
  })
}

////////////////////////////////////////////////
// Number Contract 
import { $Number } from './contract-number'
function createNumberContract(): $Number<number> {
  return $Number.create({
    optional: false,
    nullable: false,
  })
}

////////////////////////////////////////////////
// Bigint Contract 
import { $Bigint } from './contract-bigint'
function createBigintContract(): $Bigint<bigint> {
  return $Bigint.create({
    optional: false,
    nullable: false,
  })
}

////////////////////////////////////////////////
// String Contract 
import { $String } from './contract-string'
function createStringContract(): $String<string> {
  return $String.create({
    optional: false,
    nullable: false,
  })
}

////////////////////////////////////////////////
// Struct Contract 
import { $Struct } from './contract-struct'
function createObjectContract<S extends $Struct.Shape>(shape: S): $Struct<{
  readonly [K in keyof S]: S[K] extends CoreContract<infer T> ? T : never
}> {
  return $Struct.create(shape, {
    optional: false,
    nullable: false
  })
}

////////////////////////////////////////////////
// Array Contract 
import { $Array } from './contract-array'
function createArrayContract<S extends $Array.Shape>(shape: S): $Array<CoreContract.Infer<S>[]> {
  return $Array.create({
    optional: false,
    nullable: false
  })
}

////////////////////////////////////////////////
// Enum Contract
import { $Enum } from './contract-enum'
export function createEnumContract<const S extends string[]>(...values: S): $Enum<S[number], S> {
  return $Enum.create(values, { optional: false, nullable: false })
}

////////////////////////////////////////////////
// Date Contract 
import { $Date } from './contract-date'
function createDateContract(): $Date<Date> {
  return $Date.create({
    optional: false,
    nullable: false,
  })
}


////////////////////////////////////////////////
// Contract Methods
export const Contract = Object.freeze({
  boolean: createBooleanContract,
  struct: createObjectContract,
  string: createStringContract,
  number: createNumberContract,
  bigint: createBigintContract,
  array: createArrayContract,
  enum: createEnumContract,
  date: createDateContract,
})

////////////////////////////////////////////////
// Contract Types
export declare namespace Contract {
  export type Infer<T extends CoreContract> = CoreContract.Infer<T>
}
