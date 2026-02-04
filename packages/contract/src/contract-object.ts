import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'

export declare namespace $Object {
  export type Shape = Record<string, CoreContract>
}

export class $Object<T extends CoreNullable.Record> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Object.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Object.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Record = {}, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): $Object<CoreContract.Output<T, P>> {
    return new $Object(options)
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = $Object.resolveProperties(options)
  }

  public optional(): $Object<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Object<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $Object<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Object<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): $Object<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): $Object<CoreContract.Output<T, P>> {
    return $Object.create({ ...this.properties, ...options }) as $Object<CoreContract.Output<T, P>>
  }

  public assert(input: unknown, error?: (new (message: string) => Error) | undefined): T {
    return input as T
  }

  public parse(input: unknown): CoreParser.Result<T> {
    return { success: true, value: input } as CoreParser.Result<T>
  }
}