import { CoreNullable } from '@nodelith/core'
import { CoreParser } from './core-parser'

export declare namespace CoreContract {
  export type Options = {
    readonly optional?: boolean
    readonly nullable?: boolean
  }
  export type DefaultProperties = {
    readonly optional: false
    readonly nullable: false
  }

  export type Properties = {
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

  // export type NullabilityOutput<T, P extends CoreContract.Options> = P extends { nullable: true } 
  //   ? null : null extends T ? null : never

  // export type OptionalityOutput<T, P extends CoreContract.Options> = P extends { optional: true } 
  //   ? undefined : undefined extends T ? undefined : never

  // export type NullabilityOutput<T, P extends CoreContract.Options> = P extends { nullable: true } 
  //   ? null : P extends { nullable: false } ? Exclude<T, null> : null extends T ? null : never

  // export type OptionalityOutput<T, P extends CoreContract.Options> = P extends { optional: true } 
  //   ? undefined : P extends { optional: false } ? Exclude<T, undefined> : undefined extends T ? undefined : never

  export type Infer<C> = C extends CoreContract<infer T> ? T : never

  type ConcreteOutput<T> = Exclude<T, null |undefined>

  type NullabilityOutput<T, P extends CoreContract.Options> =
    P extends { readonly nullable: true } ? null :
    P extends { readonly nullable: false } ? never :
    null extends T ? null : never

  type OptionalityOutput<T, P extends CoreContract.Options> =
    P extends { readonly optional: true } ? undefined :
    P extends { readonly optional: false } ? never :
    undefined extends T ? undefined : never

  export type Output<T, P extends CoreContract.Options = {}> = {} extends P ? T :
    | OptionalityOutput<T, P>
    | NullabilityOutput<T, P>
    | ConcreteOutput<T>
}

export interface CoreContract<T extends CoreNullable = CoreNullable> extends CoreParser<T> {
  clone<const Pp extends CoreContract.Options>(options?: Pp): CoreContract<CoreContract.Output<T, Pp>>
}
