import { CoreIssue } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $String<T extends CoreNullable.String> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $String.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $String.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.String = string, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): $String<CoreContract.Output<NoInfer<T>, P>> {
    return new $String(options)
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = $String.resolveProperties(options)
  }

  public optional(): $String<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: true })
  }

  public nullable(): $String<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $String<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $String<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): $String<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): $String<CoreContract.Output<T, P>> {
    return $String.create({ ...this.properties, ...options }) as $String<CoreContract.Output<T, P>>
  }

  public parse(input: unknown): CoreParser.Result<T> {
    return this.run(input, false)
  }

  public normalize(input: unknown): CoreParser.Result<T> {
    return this.run(input, true)
  }

  private run(input: unknown, normalize: boolean): CoreParser.Result<T> {
    if(input === undefined) return !this.properties.optional 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into string type. Unexpected undefined value.`) ]}
      : { success: true, value: input as T }

    if(input === null) return !this.properties.nullable 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into string type. Unexpected null value.`) ]}
      : { success: true, value: input as T }

    if(typeof input === 'string') {
      return { success: true, value: input as T }
    }

    if(normalize && typeof input === 'number' && Number.isFinite(input)) {
      return { success: true, value: String(input) as T }
    }

    if(normalize && typeof input === 'bigint') {
      return { success: true, value: String(input) as T }
    }

    if(normalize && typeof input === 'boolean' && input) {
      return { success: true, value: 'true' as T }
    }

    if(normalize && typeof input === 'boolean' && !input) {
      return { success: true, value: 'false' as T }
    }

    if(normalize && typeof input === 'boolean') {
      return { success: false, issues: [ CoreIssue.create(`Could not parse input into string type. Unexpected boolean value.`) ]}
    }

    return { success: false, issues: [ CoreIssue.create('Could not parse input into string type. Unexpected value.') ] }
  }
}
