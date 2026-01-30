import { CoreParser } from './core-parser'

declare const CONTRACT_BRAND: unique symbol

export declare namespace CoreContract {
  export type Options = {
    readonly optional?: boolean
    readonly nullable?: boolean
  }

  export type Properties = {
    readonly optional: boolean
    readonly nullable: boolean
  }

  export type Defaults = {
    readonly optional: false
    readonly nullable: false
  }

  export type Brand = {
    readonly [CONTRACT_BRAND]: Properties & {
      readonly shape: unknown
    }
  }

  export type MergeOptions<P extends Properties, Pp extends Options> = {
    readonly optional: Pp["optional"] extends boolean ? Pp["optional"] : P["optional"]
    readonly nullable: Pp["nullable"] extends boolean ? Pp["nullable"] : P["nullable"]
  }

  export type InferShape<C extends Brand> = C[typeof CONTRACT_BRAND]["shape"]

  export type InferProperties<C extends Brand> = {
    readonly optional: C[typeof CONTRACT_BRAND]["optional"]
    readonly nullable: C[typeof CONTRACT_BRAND]["nullable"]
  }

  export type Root<S, P> =
    P extends { optional: true; nullable: true } ? S | null | undefined :
    P extends { optional: true } ? S | undefined :
    P extends { nullable: true } ? S | null :
    S

  export type Result<C extends CoreContract<any, any>> = CoreParser.Result<Infer<C>>

  export type Infer<C extends CoreContract<any, any>> =
    InferShape<C> extends CoreContract.ArrayShape ? CoreContract.ArrayRoot<InferShape<C>, InferProperties<C>> :
    InferShape<C> extends CoreContract.ObjectShape ? CoreContract.ObjectRoot<InferShape<C>, InferProperties<C>> :
    InferShape<C> extends CoreContract.NumberShape ? CoreContract.NumberRoot<InferShape<C>, InferProperties<C>> :
    InferShape<C> extends CoreContract.StringShape ? CoreContract.StringRoot<InferShape<C>, InferProperties<C>> :
    InferShape<C> extends CoreContract.BooleanShape ? CoreContract.BooleanRoot<InferShape<C>, InferProperties<C>> :
    never
  export type ArrayShape = CoreContract<any, any>

  export type ObjectShape = Record<string, CoreContract<any, any>>

  export type NumberShape = number

  export type StringShape = string

  export type BooleanShape = boolean

  export type ArrayRoot<S extends ArrayShape, P> = CoreContract.Root<CoreContract.Infer<S>[], P>

  export type ObjectRoot<S extends ObjectShape, P> = CoreContract.Root<{ readonly [K in keyof S]: CoreContract.Infer<S[K]> }, P>

  export type NumberRoot<S extends NumberShape, P> = CoreContract.Root<S, P>
  
  export type StringRoot<S extends StringShape, P> = CoreContract.Root<S, P>

  export type BooleanRoot<S extends BooleanShape, P> = CoreContract.Root<S, P>
}

export abstract class CoreContract<S = any, P extends CoreContract.Properties = CoreContract.Defaults> implements CoreContract.Brand, CoreParser<CoreContract.Infer<CoreContract<S, P>>> {
  declare readonly [CONTRACT_BRAND]: P & { readonly shape: S }

  protected readonly properties: {
    readonly optional: P["optional"]
    readonly nullable: P["nullable"]
  }

  protected constructor(options?: CoreContract.Options) {
    this.properties = {
      optional: (options?.optional ?? false) as P["optional"],
      nullable: (options?.nullable ?? false) as P["nullable"],
    }
  }

  abstract clone<const Pp extends CoreContract.Options>(options?: Pp): CoreContract<S, CoreContract.MergeOptions<P, Pp>>

  abstract parse(input: unknown): CoreContract.Result<CoreContract<S, P>>
}
