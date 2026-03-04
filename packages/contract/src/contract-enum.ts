import { CoreIssue } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Enum<T extends CoreNullable.String = CoreNullable.String, V extends readonly string[] = readonly string[]> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Enum.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options?.nullable : $Enum.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<const V extends readonly string[], P extends CoreContract.Options = CoreContract.DefaultProperties>(values: V, options?: P): $Enum<CoreContract.Output<NoInfer<V[number]>, P>, V> {
    return new $Enum(values, options)
  }

  protected readonly properties: CoreContract.Properties

  protected readonly values: V


  protected constructor(values: V, options?: CoreContract.Options) {
    this.properties = $Enum.resolveProperties(options)
    this.values = [...values] as unknown as V
  }

  public optional(): $Enum<CoreContract.Output<T, { optional: true }>, V> {
    return this.clone({ optional: true })
  }

  public nullable(): $Enum<CoreContract.Output<T, { nullable: true }>, V> {
    return this.clone({ nullable: true })
  }

  public required(): $Enum<CoreContract.Output<T, { optional: false; nullable: false }>, V> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Enum<CoreContract.Output<T>, V>

  public clone<const P extends CoreContract.Options>(options: P): $Enum<CoreContract.Output<T, P>, V>

  public clone<const P extends CoreContract.Options>(options?: P): $Enum<CoreContract.Output<T, P>, V> {
    return $Enum.create(this.values, { ...this.properties, ...options }) as $Enum<CoreContract.Output<T, P>, V>
  }

  public coerce(input: unknown): CoreParser.Result<T> {
    return this.parse(input) // enums do not coerce
  }

  public parse(input: unknown): CoreParser.Result<T> {
    if (input === undefined) {
      return !this.properties.optional
        ? { success: false, issues: [CoreIssue.create(`Could not parse input into enum type. Received "undefined" while expecting "string".`)] }
        : { success: true, value: input as T }
    }

    if (input === null) {
      return !this.properties.nullable
        ? { success: false, issues: [CoreIssue.create(`Could not parse input into enum type. Received "null" while expecting "string".`)] }
        : { success: true, value: input as T }
    }

    if (typeof input !== 'string') {
      return { success: false, issues: [CoreIssue.create(`Could not parse input into enum type. Received ${typeof input} while expecting "string".`)]}
    }

    if (!this.values.includes(input)) {
      return { success: false, issues: [CoreIssue.create(`Could not parse input into enum type. Unexpected value.`)] }
    }

    return { success: true, value: input as T }
  }
}