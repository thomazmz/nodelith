import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Bigint<T extends CoreNullable.Bigint> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Bigint.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Bigint.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Bigint = bigint, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): $Bigint<CoreContract.Output<NoInfer<T>, P>> {
    return new $Bigint(options)
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = $Bigint.resolveProperties(options)
  }

  public optional(): $Bigint<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: false })
  }

  public nullable(): $Bigint<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $Bigint<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Bigint<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): $Bigint<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): $Bigint<CoreContract.Output<T, P>> {
    return $Bigint.create({ ...this.properties, ...options }) as $Bigint<CoreContract.Output<T, P>>
  }
  
  public parse(input: unknown): CoreParser.Result<T> {
    return this.run(input, false)
  }

  public normalize(input: unknown): CoreParser.Result<T> {
    return this.run(input, true)
  }

  private run(input: unknown, normalize: boolean): CoreParser.Result<T> {
    throw new Error('Not implemented')
  }
}
