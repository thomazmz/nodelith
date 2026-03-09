import { CoreIssue } from '@nodelith/core'
import { CoreSchema } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'
import { CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export declare namespace $Struct {
  export type Shape = Record<string, CoreContract>
}

export class $Struct<T extends CoreNullable.Struct> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultAttributes['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultAttributes['nullable'] = false as const

  private static resolveAttributes(attributes?: Partial<CoreContract.Attributes>): CoreContract.Attributes {
    return {
      optional: typeof attributes?.optional === 'boolean' ? attributes.optional : $Struct.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof attributes?.nullable === 'boolean' ? attributes.nullable : $Struct.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<
    T extends Exclude<CoreNullable.Struct, null | undefined>,
    const P extends Partial<CoreContract.Attributes>
  >(shape: $Struct.Shape, attributes: P): $Struct<CoreContract.Output<T, P>> {
    return new $Struct<T>(shape, attributes) as unknown as $Struct<CoreContract.Output<T, P>>
  }

  public readonly attributes: CoreContract.Attributes

  protected readonly shape: $Struct.Shape

  private constructor(shape: $Struct.Shape, attributes?: Partial<CoreContract.Attributes>) {
    this.attributes = $Struct.resolveAttributes(attributes)

    this.shape = Object.freeze(Object.entries(shape).reduce((acc, [key, contract]) => {
      return { ...acc, [key]: contract.clone() }
    }, {}))
  }

  public get schema(): CoreSchema.Object {
    const properties = Object.fromEntries(Object.entries(this.shape).map(([key, contract]) => {
      return [key, contract.schema]
    })
    )

    const required = Object.entries(this.shape).flatMap(([key, contract]) =>
      !contract.attributes.optional ? [key] : []
    )
    
    return this.attributes.nullable
      ? { type: ['object', 'null'] as const, properties, required }
      : { type: 'object' as const, properties, required }
  }

  public optional(): $Struct<CoreContract.Output<T, { optional: true }>> {
    return this.clone({ optional: true })
  }

  public nullable(): $Struct<CoreContract.Output<T, { nullable: true }>> {
    return this.clone({ nullable: true })
  }

  public required(): $Struct<CoreContract.Output<T, { optional: false, nullable: false }>> {
    return this.clone({ optional: false, nullable: false })
  }

  public clone(): $Struct<CoreContract.Output<T>>
  public clone<const P extends Partial<CoreContract.Attributes>>(options: P): $Struct<CoreContract.Output<T, P>>
  public clone<const P extends Partial<CoreContract.Attributes>>(options?: P): $Struct<CoreContract.Output<T, P>> {
    return $Struct.create(this.shape, { ...this.attributes, ...options }) as $Struct<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined) return !this.attributes.optional
      ? { success: false, issues: [{
        message: `Could not coerce input into struct type. Received "undefined" while expecting "object".`,
        path: options?.path ?? '',
      }]}
      : { success: true, value: input as T }

    if (input === null) return !this.attributes.nullable
      ? { success: false, issues: [{
        message: `Could not coerce input into struct type. Received "null" while expecting "object".`,
        path: options?.path ?? '',
      }]}
      : { success: true, value: input as T }

    if (Array.isArray(input)) {
      return { success: false, issues: [{
        message: `Could not coerce input into struct type. Received "array" while expecting "object".`,
        path: options?.path ?? '',
      }]}
    }

    if (typeof input !== 'object') {
      return { success: false, issues: [{
        message: `Could not coerce input into struct type. Received ${typeof input} while expecting "object".`,
        path: options?.path ?? '',
      }]}
    }

    const proto = Object.getPrototypeOf(input)

    if (proto !== Object.prototype && proto !== null) {
      return { success: false, issues: [{
        message: `Could not coerce input into struct type. Received ${typeof input} while expecting "object".`,
        path: options?.path ?? '',
      }]}
    }

    const issues: CoreIssue[] = []
    const result: Record<string, unknown> = {}

    for (const key of Object.keys(this.shape)) {
      const nestedContract = this.shape[key]
      const nestedInput = (input as Record<string, unknown>)[key]

      const basePath = options?.path ?? ''
      const nestedPath = basePath ? `${basePath}.${key}` : key
      const nestedResult = nestedContract.coerce(nestedInput, { path: nestedPath })

      if (!nestedResult.success) {
        issues.push(...nestedResult.issues)
      } else {
        result[key] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

  public parse(input: unknown, options?: CoreParser.Options): CoreParser.Result<T> {
    if (input === undefined) return !this.attributes.optional
      ? { success: false, issues: [{
        message: `Could not parse input into struct type. Received "undefined" while expecting "object".`,
        path: options?.path ?? '',
      }]}
      : { success: true, value: input as T }

    if (input === null) return !this.attributes.nullable
      ? { success: false, issues: [{
        message: `Could not parse input into struct type. Received "null" while expecting "object".`,
        path: options?.path ?? '',
      }]}
      : { success: true, value: input as T }

    if (Array.isArray(input)) {
      return { success: false, issues: [{
        message: `Could not parse input into struct type. Received "array" while expecting "object".`,
        path: options?.path ?? '',
      }]}
    }

    if (typeof input !== 'object') {
      return { success: false, issues: [{
        message: `Could not parse input into struct type. Received ${typeof input} while expecting "object".`,
        path: options?.path ?? '',
      }]}
    }

    const prototype = Object.getPrototypeOf(input)
    if (prototype !== Object.prototype && prototype !== null) {
      return { success: false, issues: [{
        message: `Could not parse input into struct type. Received ${typeof input} while expecting "object".`,
        path: options?.path ?? '',
      }]}
    }

    const issues: CoreIssue[] = []
    const result: Record<string, unknown> = {}

    for (const key of Object.keys(this.shape)) {
      const nestedContract = this.shape[key]
      const nestedInput = (input as Record<string, unknown>)[key]

      const basePath = options?.path ?? ''
      const nestedPath = basePath ? `${basePath}.${key}` : key
      const nestedResult = nestedContract.parse(nestedInput, { path: nestedPath })

      if (!nestedResult.success) {
        issues.push(...nestedResult.issues)
      } else {
        result[key] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

}