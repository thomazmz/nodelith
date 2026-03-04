import { CoreIssue, CoreNullable } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'
import { CoreParser } from '@nodelith/core'

export declare namespace $Array {
  export type Shape<TItem extends CoreNullable = CoreNullable> = CoreContract<TItem>
}

export class $Array<T extends CoreNullable.Array> implements CoreContract<T> {
  private static readonly DEFAULT_OPTIONAL_PROPERTY: CoreContract.DefaultProperties['optional'] = false as const
  private static readonly DEFAULT_NULLABLE_PROPERTY: CoreContract.DefaultProperties['nullable'] = false as const

  private static resolveProperties(options?: CoreContract.Options): CoreContract.Properties {
    return {
      optional: typeof options?.optional === 'boolean' ? options.optional : $Array.DEFAULT_OPTIONAL_PROPERTY,
      nullable: typeof options?.nullable === 'boolean' ? options.nullable : $Array.DEFAULT_NULLABLE_PROPERTY,
    }
  }

  public static create<S extends $Array.Shape, const P extends CoreContract.Options>(
    shape: S,
    options: P
  ): $Array<CoreContract.Output<CoreContract.Infer<S>[], P>> {
    return new $Array(shape, options) as unknown as $Array<CoreContract.Output<CoreContract.Infer<S>[], P>>
  }

  protected readonly properties: CoreContract.Properties

  protected constructor(private readonly shape: $Array.Shape, options?: CoreContract.Options) {
    this.properties = $Array.resolveProperties(options)
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
  public clone<const P extends CoreContract.Options>(options: P): $Array<CoreContract.Output<T, P>>
  public clone<const P extends CoreContract.Options>(options?: P): $Array<CoreContract.Output<T, P>> {
    return $Array.create(this.shape, { ...this.properties, ...options }) as $Array<CoreContract.Output<T, P>>
  }

  public coerce(input: unknown): CoreParser.Result<T> {
    if (input === undefined) return !this.properties.optional
      ? { success: false, issues: [CoreIssue.create(`Could not coerce input into array type. Received "undefined" while expecting "array".`)] }
      : { success: true, value: input as T }

    if (input === null) return !this.properties.nullable
      ? { success: false, issues: [CoreIssue.create(`Could not coerce input into array type. Received "null" while expecting "array".`)] }
      : { success: true, value: input as T }

    if (!Array.isArray(input)) {
      return { success: false, issues: [CoreIssue.create(`Could not coerce input into array type. Received ${typeof input} while expecting "array".`)] }
    }

    const issues: CoreIssue[] = []
    const result: unknown[] = []

    for (let i = 0; i < input.length; i++) {
      const nestedInput = input[i]
      const nestedResult = this.shape.coerce(nestedInput)

      if (!nestedResult.success) {
        issues.push(...this.prefixIssues(i, nestedResult.issues))
      } else {
        result[i] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

  public parse(input: unknown): CoreParser.Result<T> {
    if (input === undefined) return !this.properties.optional
      ? { success: false, issues: [CoreIssue.create(`Could not parse input into array type. Received "undefined" while expecting "array".`)] }
      : { success: true, value: input as T }

    if (input === null) return !this.properties.nullable
      ? { success: false, issues: [CoreIssue.create(`Could not parse input into array type. Received "null" while expecting "array".`)] }
      : { success: true, value: input as T }

    if (!Array.isArray(input)) {
      return { success: false, issues: [CoreIssue.create(`Could not parse input into array type. Received ${typeof input} while expecting "array".`)] }
    }

    const issues: CoreIssue[] = []
    const result: unknown[] = []

    for (let i = 0; i < input.length; i++) {
      const nestedInput = input[i]
      const nestedResult = this.shape.parse(nestedInput)

      if (!nestedResult.success) {
        issues.push(...this.prefixIssues(i, nestedResult.issues))
      } else {
        result[i] = nestedResult.value
      }
    }

    if (issues.length) return { success: false, issues }

    return { success: true, value: result as T }
  }

  private prefixIssues(index: number, issues: CoreIssue[]): CoreIssue[] {
    return issues.map((issue) => {
      const message = (issue as any)?.message ?? String(issue)
      return CoreIssue.create(`[${index}]: ${message}`)
    })
  }
}