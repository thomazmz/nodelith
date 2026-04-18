import { CoreIssue } from './core-issue'

/**
 * Namespace containing shared types used by {@link CoreParser}.
 *
 * These types define the shape of parsing results and execution options.
 */
export declare namespace CoreParser {
  /**
   * Options that control parsing behavior.
   *
   * @property path - Optional path indicating the current location of the value
   * being parsed. Typically used for nested structures to provide contextual
   * error reporting (e.g. "user.address.street").
   */
  export type Options = {
    readonly path?: string
  }

  /**
   * Successful parsing result.
   *
   * @typeParam T - The inferred output type.
   *
   * @property success - Discriminant flag indicating success.
   * @property value - The parsed (and possibly derived) value.
   */
  export type Success<T> = {
    readonly success: true
    readonly value: T
  }

  /**
   * Failed parsing result.
   *
   * @property success - Discriminant flag indicating failure.
   * @property issues - A collection of issues describing why parsing failed.
   *
   * Notes:
   * - Multiple issues may be returned to provide full error visibility.
   * - Issues should include path/context information when available.
   */
  export type Failure = {
    readonly success: false
    readonly issues: CoreIssue[]
  }

  /**
   * Result of a parsing operation.
   *
   * This is a discriminated union:
   * - On success → `{ success: true, value }`
   * - On failure → `{ success: false, issues }`
   *
   * Guarantees:
   * - No exceptions are thrown; all outcomes are represented in the result.
   * - The `success` field can be used for type narrowing.
   * - The object is immutable.
   *
   * @typeParam T - The inferred output type on success.
   */
  export type Result<T> = (
    | Success<T>
    | Failure
  )
}

/**
 * CoreParser is the minimal interface for transforming unknown input into a typed value.
 *
 * It provides two distinct operations:
 *
 * - `parse`: Validates the input and returns a new valid object as result without modifying the input.
 * - `coerce`: Attempts to coerce the input and returns a new valid object as result without modifying the input.
 *
 * When implemented, both methods should be pure and deterministic:
 * - They do not throw.
 * - They always return a {@link CoreParser.Result}.
 * - They do not mutate the input.
 *
 * Implementations must ensure consistent validation rules between `parse` and `coerce`,
 * with `coerce` only adding a transformation step, not altering validation semantics.
 *
 * @typeParam T - The output type produced on successful parsing.
 */
export interface CoreParser<T = any> {
  /**
   * Validates the input and returns a new valid object as result without modifying the input.
   *
   * @param input - The value to validate.
   * @param options - Optional parsing behavior configuration.
   * @returns A result object indicating success or failure.
   */
  parse(input: unknown, options?: CoreParser.Options): CoreParser.Result<T>

  /**
   * Attempts to coerce the input and returns a new valid object as result without modifying the input.
   *
   * @param input - The value to coerce and validate.
   * @param options - Optional parsing behavior configuration.
   * @returns A result object indicating success or failure.
   */
  coerce(input: unknown, options?: CoreParser.Options): CoreParser.Result<T>
}