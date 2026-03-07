import { CoreIssue } from '@nodelith/core'
import { CoreSchema } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Enum<T extends CoreNullable.String = CoreNullable.String, V extends readonly string[] = readonly string[]> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultAttributes['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultAttributes['nullable'] = false as const

  private static resolveAttributes(attributes?: Partial<CoreContract.Attributes>): CoreContract.Attributes {
    return {
      optional: typeof attributes?.optional === 'boolean' ? attributes.optional : $Enum.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof attributes?.nullable === 'boolean' ? attributes.nullable : $Enum.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<const V extends readonly string[], const P extends Partial<CoreContract.Attributes>>(
    values: V,
    attributes: P
  ): $Enum<CoreContract.Output<NoInfer<V[number]>, P>, V> {
    return new $Enum(values, attributes) as unknown as $Enum<CoreContract.Output<NoInfer<V[number]>, P>, V>
  }

  public readonly attributes: CoreContract.Attributes

  protected readonly values: V

  private constructor(values: V, attributes?: Partial<CoreContract.Attributes>) {
    this.attributes = $Enum.resolveAttributes(attributes)
    this.values = [...values] as unknown as V
  }

  public get schema(): CoreSchema.Enum {
    return this.attributes.nullable
      ? { type: ['string', 'null'] as const, enum: [...this.values, null] }
      : { type: 'string' as const, enum: [...this.values] }
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
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes: P): $Enum<CoreContract.Output<T, P>, V>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes?: P): $Enum<CoreContract.Output<T, P>, V> {
    return $Enum.create(this.values, { ...this.attributes, ...attributes }) as $Enum<CoreContract.Output<T, P>, V>
  }

  public coerce(input: unknown): CoreParser.Result<T> {
    return this.parse(input) // enums do not coerce
  }

  public parse(input: unknown): CoreParser.Result<T> {
    if (input === undefined) {
      return !this.attributes.optional
        ? { success: false, issues: [CoreIssue.create(`Could not parse input into enum type. Received "undefined" while expecting "string".`)] }
        : { success: true, value: input as T }
    }

    if (input === null) {
      return !this.attributes.nullable
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