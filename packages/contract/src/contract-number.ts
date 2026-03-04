import { CoreIssue } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Number<T extends CoreNullable.Number> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Number.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options?.nullable : $Number.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Number = number, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): $Number<CoreContract.Output<NoInfer<T>, P>> {
    return new $Number(options)
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = $Number.resolveProperties(options)
  }

  public optional(): $Number<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Number<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $Number<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Number<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): $Number<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): $Number<CoreContract.Output<T, P>> {
    return $Number.create({ ...this.properties, ...options }) as $Number<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown): CoreParser.Result<T> {
    if (input === undefined || input === null) {
      return this.parse(input)
    }

    if (typeof input === 'number' && !Number.isNaN(input)) {
      return this.parse(input)
    }

    if (typeof input === 'boolean' && input === true) {
      return this.parse(1)
    }

    if (typeof input === 'boolean' && input === false) {
      return this.parse(0)
    }

    if (typeof input === 'string' && input.trim() !== '' && !Number.isNaN(Number(input))) {
      return this.parse(Number(input))
    }

    if (typeof input === 'bigint' && input <= BigInt(Number.MAX_SAFE_INTEGER) && input >= BigInt(Number.MIN_SAFE_INTEGER)) {
      return this.parse(Number(input))
    }

    if (typeof input === 'number') {
      return { success: false, issues: [CoreIssue.create(`Could not coerce NaN into number.`)] }
    }

    if (typeof input === 'string') {
      return { success: false, issues: [CoreIssue.create(`Could not coerce string into number.`)] }
    }

    if (typeof input === 'bigint') {
      return { success: false, issues: [CoreIssue.create(`Could not coerce bigint into number. Value out of safe integer range.`)] }
    }

    return this.parse(input)
  }

  public parse(input: unknown): CoreParser.Result<T> {
    if(input === undefined) return !this.properties.optional 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into number type. Received "undefined" while expecting "number".`) ]}
      : { success: true, value: input as T }

    if(input === null) return !this.properties.nullable 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into number type. Received "null" while expecting "number".`) ]}
      : { success: true, value: input as T }

    if(typeof input === 'number' && !Number.isNaN(input)) {
      return { success: true, value: input as T }
    }

    return { success: false, issues: [ CoreIssue.create(`Could not parse input into number type. Received ${typeof input} while expecting "number".`) ] }
  }
}