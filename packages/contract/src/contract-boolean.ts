import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Boolean<T extends CoreNullable.Boolean> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Boolean.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Boolean.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Boolean = boolean, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): $Boolean<CoreContract.Output<NoInfer<T>, P>> {
    return new $Boolean(options)
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = $Boolean.resolveProperties(options)
  }

  public optional(): $Boolean<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Boolean<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $Boolean<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Boolean<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): $Boolean<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): $Boolean<CoreContract.Output<T, P>> {
    return $Boolean.create({ ...this.properties, ...options }) as $Boolean<CoreContract.Output<T, P>>
  }

  public parse(input: unknown): CoreParser.Result<T> {
    return { success: true, value: input } as CoreParser.Result<T>
  }
}
