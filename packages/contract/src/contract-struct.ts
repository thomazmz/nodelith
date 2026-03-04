import { CoreIssue, CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'

export declare namespace $Struct {
  export type Shape = Record<string, CoreContract>
}

export class $Struct<T extends CoreNullable.Struct> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Struct.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Struct.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<T extends Exclude<CoreNullable.Struct, null | undefined>, const P extends CoreContract.Options>(
    shape: $Struct.Shape,
    options: P
  ): $Struct<CoreContract.Output<T, P>> {
    return new $Struct<T>(shape, options) as unknown as $Struct<CoreContract.Output<T, P>>
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(private readonly shape: $Struct.Shape, options?: CoreContract.Options) {
    this.properties = $Struct.resolveProperties(options)
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
  public clone<const P extends CoreContract.Options>(options: P): $Struct<CoreContract.Output<T, P>>
  public clone<const P extends CoreContract.Options>(options?: P): $Struct<CoreContract.Output<T, P>> {
    return $Struct.create(this.shape, { ...this.properties, ...options }) as $Struct<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown): CoreParser.Result<T> {
    if (input === undefined) return !this.properties.optional
      ? { success: false, issues: [CoreIssue.create(`Could not coerce input into struct type. Received "undefined" while expecting "object".`)] }
      : { success: true, value: input as T }

    if (input === null) return !this.properties.nullable
      ? { success: false, issues: [CoreIssue.create(`Could not coerce input into struct type. Received "null" while expecting "object".`)] }
      : { success: true, value: input as T }

    if (Array.isArray(input)) {
      return { success: false, issues: [CoreIssue.create(`Could not coerce input into struct type. Received "array" while expecting "object".`)] }
    }

    if (typeof input !== 'object') {
      return { success: false, issues: [CoreIssue.create(`Could not coerce input into struct type. Received ${typeof input} while expecting "object".`)] }
    }

    const proto = Object.getPrototypeOf(input)

    if (proto !== Object.prototype && proto !== null) {
      return { success: false, issues: [CoreIssue.create(`Could not coerce input into struct type. Received ${typeof input} while expecting "object".`)] }
    }

    const issues: CoreIssue[] = []
    const result: Record<string, unknown> = {}

    for (const key of Object.keys(this.shape)) {
      const nestedContract = this.shape[key]
      const nestedInput = (input as Record<string, unknown>)[key]

      const nestedResult = nestedContract.coerce(nestedInput)

      if (!nestedResult.success) {
        issues.push(...this.prefixIssues(key, nestedResult.issues))
      } else {
        result[key] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

  public parse(input: unknown): CoreParser.Result<T> {
    if (input === undefined) return !this.properties.optional
      ? { success: false, issues: [CoreIssue.create(`Could not parse input into struct type. Received "undefined" while expecting "object".`)] }
      : { success: true, value: input as T }

    if (input === null) return !this.properties.nullable
      ? { success: false, issues: [CoreIssue.create(`Could not parse input into struct type. Received "null" while expecting "object".`)] }
      : { success: true, value: input as T }

    if (Array.isArray(input)) {
      return { success: false, issues: [CoreIssue.create(`Could not parse input into struct type. Received "array" while expecting "object".`)] }
    }

    if (typeof input !== 'object') {
      return { success: false, issues: [CoreIssue.create(`Could not parse input into struct type. Received ${typeof input} while expecting "object".`)] }
    }

    const proto = Object.getPrototypeOf(input)

    if (proto !== Object.prototype && proto !== null) {
      return { success: false, issues: [CoreIssue.create(`Could not parse input into struct type. Received ${typeof input} while expecting "object".`)] }
    }

    const issues: CoreIssue[] = []
    const result: Record<string, unknown> = {}

    for (const key of Object.keys(this.shape)) {
      const nestedContract = this.shape[key]
      const nestedInput = (input as Record<string, unknown>)[key]

      const nestedResult = nestedContract.parse(nestedInput)

      if (!nestedResult.success) {
        issues.push(...this.prefixIssues(key, nestedResult.issues))
      } else {
        result[key] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

  private prefixIssues(path: string, issues: CoreIssue[]): CoreIssue[] {
    return issues.map((issue) => {
      const message = (issue as any)?.message ?? String(issue)
      return CoreIssue.create(`${path}: ${message}`)
    })
  }
}