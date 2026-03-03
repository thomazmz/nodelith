import { CoreIssue }  from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'

export class $Enum<T extends CoreNullable = CoreNullable, V extends CoreNullable[] = CoreNullable[]> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Enum.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Enum.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<const V extends CoreNullable[], P extends CoreContract.Options = CoreContract.DefaultProperties>(values: V, options?: P): $Enum<CoreContract.Output<V[number], P>, V> {
    return new $Enum(values, options)
  }

  protected readonly properties: CoreContract.Properties
  protected readonly values: V
  private readonly set: ReadonlySet<CoreNullable>

  protected constructor(values: V, options?: CoreContract.Options) {
    this.values = values
    this.properties = $Enum.resolveProperties(options)
    this.set = new Set(values as readonly CoreNullable[])
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

  public parse(input: unknown): CoreParser.Result<T> {
    return this.run(input)
  }

  public normalize(input: unknown): CoreParser.Result<T> {
    return this.run(input)
  }

  private run(input: unknown): CoreParser.Result<T> {
    if (input === undefined) {
      if (this.properties.optional) return { success: true, value: input as T }
      return { success: false, issues: [ CoreIssue.create(`Could not parse input into enum type. Unexpected undefined value.`) ]}
    }

    if (input === null) {
      if (this.properties.nullable) return { success: true, value: input as T }
      return { success: false, issues: [ CoreIssue.create(`Could not parse input into enum type. Unexpected null value.`) ]}
    }

    if (!this.set.has(input as CoreNullable)) {
      return { success: false, issues: [ CoreIssue.create(`Could not parse input into enum type. Unexpected value.`) ]}
    }

    return { success: true, value: input as T }
  }
}
