import * as Types from '@nodelith/types'
import { ValidationFunction } from './validation-function'

/*
 * Validates an unknown value against a schema.
 */
export abstract class Validator<V extends Types.Value = Types.Value> {

  public abstract validate(
    ...args: Parameters<ValidationFunction<Types.Value>>
  ): ReturnType<ValidationFunction<Types.Value>>
  

  /**
   * @description Attempts to cast a value according to the schema, acting as a type guard.
   * @returns {boolean} - Returns true if the value conforms to the schema, otherwise false.
   */
  public cast(value: unknown): value is V {
    const [ validationError ] = this.validate(value)
    return !Boolean(validationError)
  }

  /**
   * @description Validates a value against the schema. If validation succeeds, returns true. Otherwise, throws a ValidationError.
   * @returns {true} - Returns true if validation is successful.
   * @throws {ValidationError} - Throws an error if validation fails.
   */
  public assert(value: unknown): true | never {
    const [ validationError ] = this.validate(value)

    if(validationError) {
      throw validationError
    }

    return true
  }

  /**
   * @description Validates a value and returns the validation error if validation fails.
   * @returns {Error | undefined} - Returns the ValidationError if validation fails, otherwise undefined.
   */
  public error(value: unknown): Error | undefined {
    const [ validationError ] = this.validate(value)
    return validationError
  }
}
