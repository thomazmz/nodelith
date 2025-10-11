import { JoiValidator } from './joi-validator';
import { boolean } from './joi-boolean';
import { object } from './joi-object';
import { string } from './joi-string';
import { number } from './joi-number';
import { date } from './joi-date';

describe("joi-validator", () => {
  const validator = new JoiValidator(
    object({
      boolean: boolean(),
      string: string(),
      number: number(),
      date: date(),
    })
  );

  const validValue = {
    boolean: true,
    string: "string",
    number: 123,
    date: new Date(),
  };

  const invalidValue = {
    boolean: "true",
    string: 123,
    number: "123",
    date: new Date(),
  };

  describe("cast", () => {
    it("should return true when value being validated fits the validator schema", () => {
      const result = validator.cast(validValue);
      expect(result).toBe(true);
    });

    it("should return false when value being validated does not fits the validator schema ", () => {
      const result = validator.cast(invalidValue);
      expect(result).toBe(false);
    });
  });

  describe("validate", () => {
    it("should return true when value being validated fits the validator schema", () => {
      const result = validator.validate(validValue);
      expect(result).toBe(true);
    });

    it("should return false when value being validated does not fits the validator schema ", () => {
      const result = validator.validate(invalidValue);
      expect(result).toBe(false);
    });
  });

  describe("assert", () => {
    it("should return true when value being validated fits the validator schema", () => {
      const result = validator.assert(validValue);
      expect(result).toBe(true);
    });
    it("should throw an error when value being validated does not fits the validator schema", () => {
      expect(() => {
        validator.assert(invalidValue);
      }).toThrow();
    });
  });

  describe("extractValidationError", () => {
    it("should return a validation error when the object being validated does not fits the validator schema", () => {
      const result = validator.extractValidationError(invalidValue);
      expect(result).toBeTruthy();
    });

    it("should return undefined when t he object being validated fits the validator schema", () => {
      const result = validator.extractValidationError(validValue);
      expect(result).toBe(undefined);
    });
  });
});
