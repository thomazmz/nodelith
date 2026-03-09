import { CoreIssue } from '@nodelith/core'
import { CoreSchema } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Bigint<T extends CoreNullable.Bigint> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultAttributes['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultAttributes['nullable'] = false as const

  private static resolveAttributes(attributes?: Partial<CoreContract.Attributes>): CoreContract.Attributes {
    return {
      optional: typeof attributes?.optional === 'boolean' ? attributes.optional : $Bigint.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof attributes?.nullable === 'boolean' ? attributes.nullable : $Bigint.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Bigint = bigint, P extends Partial<CoreContract.Attributes> = CoreContract.DefaultAttributes>(attributes: P): $Bigint<CoreContract.Output<NoInfer<T>, P>> {
    return new $Bigint(attributes)
  }

  public readonly attributes: CoreContract.Attributes

  private constructor(attributes?: Partial<CoreContract.Attributes>) {
    this.attributes = $Bigint.resolveAttributes(attributes)
  }

  public get schema(): CoreSchema.Bigint {
    return this.attributes.nullable
      ? { type: ['string', 'null'] as const, format: 'bigint' as const }
      : { type: 'string' as const, format: 'bigint' as const }
  }

  public optional(): $Bigint<CoreContract.Output<T, { optional: true}>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Bigint<CoreContract.Output<T, { nullable: true}>> {
    return this.clone({ nullable: true })
  }

  public required(): $Bigint<CoreContract.Output<T, { optional: false, nullable: false } >> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Bigint<CoreContract.Output<T>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes: P): $Bigint<CoreContract.Output<T, P>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes?: P): $Bigint<CoreContract.Output<T, P>> {
    return $Bigint.create({ ...this.attributes, ...attributes }) as $Bigint<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined || input === null) {
      return this.parse(input, options)
    }

    if (typeof input === 'bigint') {
      return this.parse(input, options)
    }

    if (typeof input === 'boolean' && input === true) {
      return this.parse(1n, options)
    }

    if (typeof input === 'boolean' && input === false) {
      return this.parse(0n, options)
    }

    if (typeof input === 'string' && input.trim() !== '') {
      try {
        return this.parse(BigInt(input), options)
      } catch {
        return this.parse(input, options)
      }
    }

    if (typeof input === 'number' && Number.isFinite(input) && Number.isInteger(input)) {
      return this.parse(BigInt(input), options)
    }

    if (typeof input === 'number') {
      return { success: false, issues: [{ message: `Could not coerce number into bigint.`, path: options?.path ?? '' }] }
    }

    return this.parse(input, options)
  }

  public parse(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if(input === undefined) return !this.attributes.optional
      ? { success: false, issues: [{ message: `Could not parse input into bigint type. Received "undefined" while expecting "bigint".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if(input === null) return !this.attributes.nullable
      ? { success: false, issues: [{ message: `Could not parse input into bigint type. Received "null" while expecting "bigint".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if(typeof input === 'bigint') {
      return { success: true, value: input as T }
    }

    return { success: false, issues: [{ message: `Could not parse input into bigint type. Received ${typeof input} while expecting "bigint".`, path: options?.path ?? '' }] }
  }
}