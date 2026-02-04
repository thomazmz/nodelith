import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'

export declare namespace $Array {
  export type Shape<TItem extends CoreNullable = CoreNullable> = CoreContract<TItem>
}

export class $Array<T extends CoreNullable.Array = CoreNullable.Array> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Array.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Array.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Array = CoreNullable.Array, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): $Array<CoreContract.Output<T, P>> {
    return new $Array(options)
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = $Array.resolveProperties(options)
  }

  public optional(): $Array<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Array<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $Array<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Array<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): $Array<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): $Array<CoreContract.Output<T, P>> {
    return $Array.create({ ...this.properties, ...options }) as $Array<CoreContract.Output<T, P>>
  }
  
  public parse(input: unknown): CoreParser.Result<T> {
    return this.run(input, true)
  }

  public normalize(input: unknown): CoreParser.Result<T> {
    return this.run(input, true)
  }

  private run(input: unknown, normalize: boolean): CoreParser.Result<T> {
    return { success: true, value: input as T }
  }
}