import { Constructor } from '@nodelith/utilities'
import { Value, Validator } from '@nodelith/context';
import joi, { Schema, ValidationResult } from 'joi';

export class JoiValidator<V extends Value> implements Validator<V> {

  public static create<V extends Value>(
    schema: Schema<V>, 
    errorClass?: Constructor<Error>,
  ): Validator<V> {
    return new JoiValidator(schema, errorClass)
  }

  public constructor(
    private readonly schema: Schema<V>, 
    private readonly errorClass: Constructor<Error> = Error
  ) {}

  public cast(value: unknown): value is V {
    return this.validate(value);
  }

  public validate(value: unknown): boolean {
    const { error } = this.validateAgainstSchema(value);
    return !error;
  }

  public assert(value: unknown): true | void {
    const { error } = this.validateAgainstSchema(value);
    return error ? this.throwError(error.message) : true;
  }

  public extractValidationError(value: unknown): Error | undefined {
    const validationResult = this.validateAgainstSchema(value);
    return validationResult.error
      ? this.mapError(validationResult.error)
      : undefined;
  }

  protected mapError(error: joi.ValidationError): Error {
    return new Error(error.message);
  }

  protected validateAgainstSchema(
    objectUnderValidation: unknown,
    validateAll = true
  ): ValidationResult {
    return this.schema.strict(true).validate(objectUnderValidation, {
      abortEarly: validateAll,
    });
  }

  protected throwError(message: string): void {
    throw new this.errorClass(message);
  }
}
