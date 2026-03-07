import { CoreIssue } from '@nodelith/core'
import { CoreSchema } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Boolean<T extends CoreNullable.Boolean> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultAttributes['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultAttributes['nullable'] = false as const

  private static resolveAttributes(attributes?: Partial<CoreContract.Attributes>): CoreContract.Attributes {
    return {
      optional: typeof attributes?.optional === 'boolean' ? attributes.optional : $Boolean.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof attributes?.nullable === 'boolean' ? attributes.nullable : $Boolean.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Boolean = boolean, P extends Partial<CoreContract.Attributes> = CoreContract.DefaultAttributes>(attributes: P): $Boolean<CoreContract.Output<NoInfer<T>, P>> {
    return new $Boolean(attributes)
  }

  public readonly attributes: CoreContract.Attributes

  private constructor(attributes?: Partial<CoreContract.Attributes>) {
    this.attributes = $Boolean.resolveAttributes(attributes)
  }

  public get schema(): CoreSchema.Boolean {
    return this.attributes.nullable
      ? { type: ['boolean', 'null'] as const }
      : { type: 'boolean' as const }
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
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes: P): $Boolean<CoreContract.Output<T, P>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes?: P): $Boolean<CoreContract.Output<T, P>> {
    return $Boolean.create({ ...this.attributes, ...attributes }) as $Boolean<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown): CoreParser.Result<T> {
    if (input === undefined || input === null) {
      return this.parse(input)
    }

    if (typeof input === 'boolean') {
      return this.parse(input)
    }

    if (typeof input === 'string' && input === 'true') {
      return this.parse(true)
    }

    if (typeof input === 'string' && input === 'false') {
      return this.parse(false)
    }

    if (typeof input === 'string' && input === '1') {
      return this.parse(true)
    }

    if (typeof input === 'string' && input === '0') {
      return this.parse(false)
    }

    if (typeof input === 'number' && input === 1) {
      return this.parse(true)
    }

    if (typeof input === 'number' && input === 0) {
      return this.parse(false)
    }

    if (typeof input === 'bigint' && input === 1n) {
      return this.parse(true)
    }

    if (typeof input === 'bigint' && input === 0n) {
      return this.parse(false)
    }

    return this.parse(input)
  }

  public parse(input: unknown): CoreParser.Result<T> {
    if(input === undefined) return !this.attributes.optional 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into boolean type. Received "undefined" while expecting "boolean".`) ]}
      : { success: true, value: input as T }

    if(input === null) return !this.attributes.nullable 
      ? { success: false, issues: [ CoreIssue.create(`Could not parse input into boolean type. Received "null" while expecting "boolean".`) ]}
      : { success: true, value: input as T }

    if(typeof input === 'boolean') {
      return { success: true, value: input as T }
    }

    return { success: false, issues: [ CoreIssue.create(`Could not parse input into boolean type. Received ${typeof input} while expecting "boolean".`) ] }
  }
}