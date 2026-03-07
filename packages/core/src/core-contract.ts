import { CoreNullable } from '@nodelith/core'
import { CoreParser } from './core-parser'
import { CoreSchema } from './core-schema'

type InferOutputPrimitive<T> = Exclude<T, null |undefined>

type InferOutputNullability<T, P extends Partial<CoreContract.Attributes>> =
  P extends { readonly nullable: true } ? null :
  P extends { readonly nullable: false } ? never :
  null extends T ? null : never

type InferOutputOptionality<T, P extends Partial<CoreContract.Attributes>> =
  P extends { readonly optional: true } ? undefined :
  P extends { readonly optional: false } ? never :
  undefined extends T ? undefined : never

export declare namespace CoreContract {
  export type DefaultAttributes = {
    readonly optional: false
    readonly nullable: false
  }

  export type Schema = string

  export type Attributes = {
    readonly optional: boolean
    readonly nullable: boolean
  }

  export type InferOptions<T extends CoreNullable> = {
    readonly optional?: undefined extends T ? true : false
    readonly nullable?: null extends T ? true : false
  }

  export type InferProperties<T extends CoreNullable> = {
    readonly optional: undefined extends T ? true : false
    readonly nullable: null extends T ? true : false
  }

  export type Infer<C> = C extends CoreContract<infer T> ? T : never

  export type Output<T, P extends Partial<CoreContract.Attributes> = {}> = {} extends P ? T :
    | InferOutputOptionality<T, P>
    | InferOutputNullability<T, P>
    | InferOutputPrimitive<T>
}

export interface CoreContract<T extends CoreNullable = CoreNullable> extends CoreParser<T> {
  readonly schema: CoreSchema
  readonly attributes: CoreContract.Attributes
  clone<const Pp extends Partial<CoreContract.Attributes>>(options?: Pp): CoreContract<CoreContract.Output<T, Pp>>
}
