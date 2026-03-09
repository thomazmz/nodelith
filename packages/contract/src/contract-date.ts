import { CoreIssue } from '@nodelith/core'
import { CoreSchema } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class $Date<T extends CoreNullable.Date> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultAttributes['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultAttributes['nullable'] = false as const

  private static resolveAttributes(attributes?: Partial<CoreContract.Attributes>): CoreContract.Attributes {
    return {
      optional: typeof attributes?.optional === 'boolean' ? attributes.optional : $Date.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof attributes?.nullable === 'boolean' ? attributes.nullable : $Date.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends CoreNullable.Date = Date, const P extends Partial<CoreContract.Attributes> = CoreContract.DefaultAttributes>(
    attributes: P
  ): $Date<CoreContract.Output<NoInfer<T>, P>> {
    return new $Date(attributes) as unknown as $Date<CoreContract.Output<NoInfer<T>, P>>
  }

  public readonly attributes: CoreContract.Attributes

  private constructor(attributes?: Partial<CoreContract.Attributes>) {
    this.attributes = $Date.resolveAttributes(attributes)
  }

  public get schema(): CoreSchema.Date {
    return this.attributes.nullable
      ? { type: ['string', 'null'] as const, format: 'iso8601' as const }
      : { type: 'string' as const, format: 'iso8601' as const }
  }

  public optional(): $Date<CoreContract.Output<T, { optional: true }>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Date<CoreContract.Output<T, { nullable: true }>> {
    return this.clone({ nullable: true })
  }

  public required(): $Date<CoreContract.Output<T, { optional: false, nullable: false }>> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Date<CoreContract.Output<T>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes: P): $Date<CoreContract.Output<T, P>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes?: P): $Date<CoreContract.Output<T, P>> {
    return $Date.create({ ...this.attributes, ...attributes }) as $Date<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined || input === null) {
      return this.parse(input, options)
    }

    if (input instanceof Date) {
      return this.parse(input, options)
    }

    if (typeof input === 'string' && input.trim() !== '') {
      const date = new Date(input)
      if (!Number.isNaN(date.getTime())) {
        return this.parse(date, options)
      }
      return this.parse(input, options)
    }

    if (typeof input === 'number' && Number.isFinite(input)) {
      const date = new Date(input)
      if (!Number.isNaN(date.getTime())) {
        return this.parse(date, options)
      }
      return this.parse(input, options)
    }

    return this.parse(input, options)
  }

  public parse(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined) return !this.attributes.optional
      ? { success: false, issues: [{ message: `Could not parse input into date type. Received "undefined" while expecting "Date".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if (input === null) return !this.attributes.nullable
      ? { success: false, issues: [{ message: `Could not parse input into date type. Received "null" while expecting "Date".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if (input instanceof Date && !Number.isNaN(input.getTime())) {
      return { success: true, value: input as T }
    }

    return {
      success: false,
      issues: [
        {
          message: `Could not parse input into date type. Received ${typeof input} while expecting "Date".`,
          path: options?.path ?? '',
        }
      ]
    }
  }
}
