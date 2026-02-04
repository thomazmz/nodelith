import { CoreParser } from '@nodelith/core'
import { CoreIssue } from '@nodelith/core'
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

  public assert(input: unknown, error?: (new (message: string) => Error) | undefined): T {
    return input as T
  }

  public parse(input: unknown): CoreParser.Result<T> {
    if(input === undefined) return !this.properties.optional 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input. Unexpected undefined value.`) ]}
      : { success: true, value: input as T }

    if(input === null) return !this.properties.nullable 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input. Unexpected null value.`) ]}
      : { success: true, value: input as T }

    if(typeof input === 'boolean') {
      return { success: true, value: input as T }
    }

    if(typeof input === 'string' && input === 'true') {
      return { success: true, value: true as T }
    }

    if(typeof input === 'string' && input === 'false') {
      return { success: true, value: false as T }
    }

    if(typeof input === 'string' && input === '1') {
      return { success: true, value: true as T }
    }

    if(typeof input === 'string' && input === '0') {
      return { success: true, value: false as T }
    }

    if(typeof input === 'string') {
      return { success: false, issues: [ CoreIssue.create(`Could not parse input. Unexpected string value.`) ]}
    }

    if(typeof input === 'number' && input === 1) {
      return { success: true, value: true as T }
    }

    if(typeof input === 'number' && input === 0) {
      return { success: true, value: false as T }
    }

    if(typeof input === 'number') {
      return { success: false, issues: [ CoreIssue.create(`Could not parse input. Unexpected number value.`) ]}
    }

    if(typeof input === 'bigint' && input === 1n) {
      return { success: true, value: true as T }
    }

    if(typeof input === 'bigint' && input === 0n) {
      return { success: true, value: false as T }
    }

    if(typeof input === 'bigint') {
      return { success: false, issues: [ CoreIssue.create(`Could not parse input. Unexpected bigint value.`) ]}
    }

    return { success: false, issues: [ CoreIssue.create('Could not parse input. Unexpected value.') ] }
  }
}
