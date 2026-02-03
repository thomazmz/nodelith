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

export type StringNullable = string | null | undefined

export class StringContract<T extends StringNullable> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : StringContract.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : StringContract.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = StringContract.resolveProperties(options)
  }

  public static create<T extends StringNullable = string, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): StringContract<CoreContract.Output<NoInfer<T>, P>> {
    return new StringContract()
  }

  public clone(): StringContract<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): StringContract<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): StringContract<CoreContract.Output<T, P>> {
    throw new Error('Method not implemented.')
  }

  public optional(): StringContract<CoreContract.Output<T, { optional: true}>> {
    return this.clone({
      optional: true
    })
  }

  public nullable(): StringContract<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({
      nullable: true
    })
  }

  public required(): StringContract<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({
      optional: false,
      nullable: false,
    })
  }

  public parse(input: unknown): CoreParser.Result<T> {
    throw new Error('Method not implemented.')
  }
}

// export type ObjectNullable = CoreNullable.Record | null | undefined

// export class ObjectContract<T extends ObjectNullable> implements CoreContract<T> {
//   private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
//   private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

//   private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
//     return {
//       optional: typeof options?.optional === 'boolean' ? options.optional : ObjectContract.DEFAULT_OPTIONAL_PROPERTY,
//       nullable: typeof options?.nullable === 'boolean' ? options.nullable : ObjectContract.DEFAULT_NULLABLE_PROPERTY,
//     }
//   }

//   protected readonly properties: CoreContract.Properties

//   protected constructor(options?: CoreContract.Options) {
//     this.properties = ObjectContract.resolveProperties(options)
//   }

//   public static create<T extends ObjectNullable = {}, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): ObjectContract<CoreContract.Output<T, P>> {
//     return new ObjectContract(options)
//   }

//   public clone(): ObjectContract<CoreContract.Output<T>>

//   public clone<const P extends CoreContract.Options>(options: P): ObjectContract<CoreContract.Output<T, P>>

//   public clone<const P extends CoreContract.Options>(options?: P): ObjectContract<CoreContract.Output<T, P>> {
//     throw new Error('Method not implemented.')
//   }

//   public optional(): ObjectContract<CoreContract.Output<T, { optional: true}>> {
//     return this.clone({
//       optional: true
//     })
//   }

//   public nullable(): ObjectContract<CoreContract.Output<T, { nullable: true}>> {
//     return this.clone({
//       nullable: true
//     })
//   }

//   public required(): ObjectContract<CoreContract.Output<T, { optional: false, nullable: false } >> {
//     return this.clone({
//       optional: false,
//       nullable: false,
//     })
//   }

//   public parse(input: unknown): CoreParser.Result<T> {
//     throw new Error('Method not implemented.')
//   }
// }


// type ObjectShape = Record<string, CoreContract>

// function object<S extends ObjectShape>(shape: S): ObjectContract<{
//   readonly [K in keyof S]: S[K] extends CoreContract<infer T> ? T : never
// }> {
//   return ObjectContract.create({
//     optional: false,
//     nullable: false
//   })
// }

// function string(): StringContract<string> {
//   return StringContract.create({
//     optional: false,
//     nullable: false,
//   })
// }

// type StringType0 = CoreContract.Infer<typeof SttringContract1>
// const StrincContract0 = string().optional().required()
// const SttringContract1 = string().clone({
//   optional: true
// }).clone({
//   optional: false,
//   nullable: true,
// })

// type ObjectType0 = CoreContract.Infer<typeof ObjectContract0>

// const ObjectContract0 = object({
//   name: string().optional().required().nullable()
// }).optional().required()
