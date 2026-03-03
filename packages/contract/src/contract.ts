
import { CoreContract, CoreNullable } from '@nodelith/core'

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
// Object Contract 
import { $Object } from './contract-object'
function createObjectContract<S extends $Object.Shape>(shape: S): $Object<{
  readonly [K in keyof S]: S[K] extends CoreContract<infer T> ? T : never
}> {
  return $Object.create(shape, {
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
export function createEnumContract<const S extends CoreNullable[]>(...values: S): $Enum<S[number], S> {
  return $Enum.create(values, {
    optional: false,
    nullable: false
  })
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
// Contract 
export const Contract = Object.freeze({
  boolean: createBooleanContract,
  object: createObjectContract,
  string: createStringContract,
  number: createNumberContract,
  bigint: createBigintContract,
  array: createArrayContract,
  enum: createEnumContract,
  date: createDateContract,
})

export declare namespace Contract {
  export type Infer<T extends CoreContract> = CoreContract.Infer<T>
}
