import { CoreIssue, CoreNullable } from '@nodelith/core'
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

  public static create<T extends Exclude<CoreNullable.Record, null | undefined>, const P extends CoreContract.Options>(shape: $Object.Shape, options: P): $Object<CoreContract.Output<T, P>> {
    return new $Object<T>(shape, options) as unknown as $Object<CoreContract.Output<T, P>>
  }

  protected readonly properties: CoreContract.Properties

  public constructor(private readonly shape: $Object.Shape, options?: CoreContract.Options) {
    this.properties = $Object.resolveProperties(options)
  }

  public optional(): $Object<CoreContract.Output<T, { optional: true}>> {
    return this.clone(this.shape, { optional: true })
  }

  public nullable(): $Object<CoreContract.Output<T, { nullable: true}>> {
    return this.clone(this.shape, { nullable: true })
  }

  public required(): $Object<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone(this.shape, { optional: false, nullable: false })
  }

  public clone(shape: $Object.Shape): $Object<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(shape: $Object.Shape, options: P): $Object<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(shape: $Object.Shape, options?: P): $Object<CoreContract.Output<T, P>> {
    return $Object.create(shape, { ...this.properties, ...options }) as $Object<CoreContract.Output<T, P>>
  }
  
  public parse(input: unknown): CoreParser.Result<T> {
    return this.run(input, false)
  }

  public normalize(input: unknown): CoreParser.Result<T> {
    return this.run(input, true)
  }

  private run(input: unknown, normalize: boolean): CoreParser.Result<T> {
    if(input === undefined) return !this.properties.optional 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into object type. Unexpected undefined value.`) ]}
      : { success: true, value: input as T }

    if(input === null) return !this.properties.nullable 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into object type. Unexpected null value.`) ]}
      : { success: true, value: input as T }

    if (typeof input !== 'object' || Array.isArray(input)) {
      return { success: false, issues: [CoreIssue.create('Could not parse input into object type. Unexpected value.') ]}
    }

    const issues: CoreIssue[] = []

    const result: Record<string, unknown> = {}

    for (const key of Object.keys(this.shape)) {
      const nestedContract = this.shape[key]

      const nestedInput = (input as Record<string, unknown>)[key]

      const nestedResult = normalize
        ? nestedContract.normalize(nestedInput)
        : nestedContract.parse(nestedInput)

      if(!nestedResult.success) {
        issues.push(...nestedResult.issues)
      } else {
        result[key] = nestedResult.value
      }
    }

    if (issues.length) return {
      success: false,
      issues
    }

    return {
      success: true,
      value: result as T
    }
  }
}