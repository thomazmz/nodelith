import { CoreIssue } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Date<T extends CoreNullable.Date> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Date.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Date.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Date = Date, P extends CoreContract.Options = CoreContract.DefaultProperties>(options: P): $Date<CoreContract.Output<NoInfer<T>, P>> {
    return new $Date(options)
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(options?: CoreContract.Options) {
    this.properties = $Date.resolveProperties(options)
  }

  public optional(): $Date<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Date<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $Date<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Date<CoreContract.Output<T>>

  public clone<const P extends CoreContract.Options>(options: P): $Date<CoreContract.Output<T, P>>

  public clone<const P extends CoreContract.Options>(options?: P): $Date<CoreContract.Output<T, P>> {
    return $Date.create({ ...this.properties, ...options }) as $Date<CoreContract.Output<T, P>>
  }

  public parse(input: unknown): CoreParser.Result<T> {
    return this.run(input, false)
  }

  public normalize(input: unknown): CoreParser.Result<T> {
    return this.run(input, true)
  }

  private run(input: unknown, normalize: boolean): CoreParser.Result<T> {
    if(input === undefined) return !this.properties.optional
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into Date type. Unexpected undefined value.`) ]}
      : { success: true, value: input as T }

    if(input === null) return !this.properties.nullable
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into Date type. Unexpected null value.`) ]}
      : { success: true, value: input as T }

    if(input instanceof Date) return !Number.isFinite(input.getTime())
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into Date type. Invalid Date value.`) ]}
      : { success: true, value: new Date(input.getTime()) as T }

    if (normalize && typeof input === 'number') {
      return this.run(new Date(input), normalize)
    }
    
    if (normalize && typeof input === 'bigint') {
      return this.run(new Date(Number(input)), normalize)
    }

    // TODO This needs improvement as behaviour can be undeterministic depending on environments.
    if(normalize && typeof input === 'string') {
      return this.run(new Date(input), normalize)
    }

    return { success: false, issues: [ CoreIssue.create('Could not parse input into Date type. Unexpected value.') ] }
  }
}
