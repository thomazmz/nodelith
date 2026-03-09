import { CoreIssue } from '@nodelith/core'
import { CoreSchema } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export declare namespace $Array {
  export type Shape<TItem extends CoreNullable = CoreNullable> = CoreContract<TItem>
}

export class $Array<T extends CoreNullable.Array> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultAttributes['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultAttributes['nullable'] = false as const

  private static resolveAttributes(attributes?: Partial<CoreContract.Attributes>): CoreContract.Attributes {
    return {
      optional: typeof attributes?.optional === 'boolean' ? attributes.optional : $Array.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof attributes?.nullable === 'boolean' ? attributes.nullable : $Array.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<S extends $Array.Shape, const P extends Partial<CoreContract.Attributes>>(
    shape: S,
    attributes: P
  ): $Array<CoreContract.Output<CoreContract.Infer<S>[], P>> {
    return new $Array(shape, attributes) as unknown as $Array<CoreContract.Output<CoreContract.Infer<S>[], P>>
  }

  public readonly attributes: CoreContract.Attributes

  private constructor(private readonly shape: $Array.Shape, attributes?: Partial<CoreContract.Attributes>) {
    this.attributes = $Array.resolveAttributes(attributes)
  }

  public get schema(): CoreSchema.Array {
    return this.attributes.nullable
      ? { type: ['array', 'null'] as const, items: this.shape.schema }
      : { type: 'array' as const, items: this.shape.schema }
  }

  public optional(): $Array<CoreContract.Output<T, { optional: true }>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Array<CoreContract.Output<T, { nullable: true }>> {
    return this.clone({ nullable: true })
  }

  public required(): $Array<CoreContract.Output<T, { optional: false, nullable: false }>> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Array<CoreContract.Output<T>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes: P): $Array<CoreContract.Output<T, P>>
  public clone<const P extends Partial<CoreContract.Attributes>>(attributes?: P): $Array<CoreContract.Output<T, P>> {
    return $Array.create(this.shape, { ...this.attributes, ...attributes }) as $Array<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined) return !this.attributes.optional
      ? { success: false, issues: [{ message: `Could not coerce input into array type. Received "undefined" while expecting "array".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if (input === null) return !this.attributes.nullable
      ? { success: false, issues: [{ message: `Could not coerce input into array type. Received "null" while expecting "array".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if (!Array.isArray(input)) {
      return { success: false, issues: [{ message: `Could not coerce input into array type. Received ${typeof input} while expecting "array".`, path: options?.path ?? '' }] }
    }

    const issues: CoreIssue[] = []
    const result: unknown[] = []

    for (let i = 0; i < input.length; i++) {
      const nestedInput = input[i]
      const basePath = options?.path ?? ''
      const nestedPath = basePath ? `${basePath}[${i}]` : `[${i}]`
      const nestedResult = this.shape.coerce(nestedInput, { path: nestedPath })

      if (!nestedResult.success) {
        issues.push(...nestedResult.issues)
      } else {
        result[i] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

  public parse(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined) return !this.attributes.optional
      ? { success: false, issues: [{ message: `Could not parse input into array type. Received "undefined" while expecting "array".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if (input === null) return !this.attributes.nullable
      ? { success: false, issues: [{ message: `Could not parse input into array type. Received "null" while expecting "array".`, path: options?.path ?? '' }] }
      : { success: true, value: input as T }

    if (!Array.isArray(input)) {
      return { success: false, issues: [{ message: `Could not parse input into array type. Received ${typeof input} while expecting "array".`, path: options?.path ?? '' }] }
    }

    const issues: CoreIssue[] = []
    const result: unknown[] = []

    const basePath = options?.path ?? ''

    for (let i = 0; i < input.length; i++) {
      const nestedInput = input[i]
      const nestedPath = basePath ? `${basePath}[${i}]` : `[${i}]`
      const nestedResult = this.shape.parse(nestedInput, { path: nestedPath })

      if (!nestedResult.success) {
        issues.push(...nestedResult.issues)
      } else {
        result[i] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

}