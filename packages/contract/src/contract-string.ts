import { CoreIssue } from '@nodelith/core'
import { CoreSchema } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $String<T extends CoreNullable.String> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultAttributes['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultAttributes['nullable'] = false as const

  private static resolveAttributes(attributes?: Partial<CoreContract.Attributes>): CoreContract.Attributes {
    return {
      optional: typeof attributes?.optional === 'boolean' ? attributes.optional : $String.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof attributes?.nullable === 'boolean' ? attributes.nullable : $String.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.String = string, const P extends Partial<CoreContract.Attributes> = CoreContract.DefaultAttributes>(
    attributes: P
  ): $String<CoreContract.Output<NoInfer<T>, P>> {
    return new $String(attributes) as unknown as $String<CoreContract.Output<NoInfer<T>, P>>
  }

  public readonly attributes: CoreContract.Attributes

  private constructor(attributes?: Partial<CoreContract.Attributes>) {
    this.attributes = $String.resolveAttributes(attributes)
  }

  public get schema(): CoreSchema.String {
    return this.attributes.nullable
      ? { type: ['string', 'null'] as const }
      : { type: 'string' as const }
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
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes: P): $String<CoreContract.Output<T, P>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes?: P): $String<CoreContract.Output<T, P>> {
    return $String.create({ ...this.attributes, ...attributes }) as $String<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined || input === null) {
      return this.parse(input, options)
    }

    if (typeof input === 'string') {
      return this.parse(input, options)
    }

    if (input instanceof String) {
      return this.parse(input.valueOf(), options)
    }

    if(typeof input === 'boolean') {
      return this.parse(String(input), options)
    }

    if (typeof input === 'bigint') {
      return this.parse(String(input), options)
    }

    if (typeof input === 'number' && Number.isFinite(input)) {
      return this.parse(String(input), options) 
    }

    if (typeof input === 'number') { 
      return { success: false, issues: [{ message: `Could not coerce non-finite number into string.`, path: options?.path ?? '' }] }
    }  

    return this.parse(input, options)
  }

  public parse(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if(input === undefined) return !this.attributes.optional 
      ? { success: false, issues: [{ message: `Could not parse input into string type. Received "undefined" while expecting "string".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if(input === null) return !this.attributes.nullable 
      ? { success: false, issues: [{ message: `Could not parse input into string type. Received "null" while expecting "string".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if(typeof input === 'string') {
      return { success: true, value: input as T }
    }

    return { success: false, issues: [{ message: `Could not parse input into string type. Received ${typeof input} while expecting "string".`, path: options?.path ?? '' }] }
  }
}
