import { ValidationError } from './validation-error'

describe('ValidationError', () => {
  it('should be instance of ValidationError', () => {
    expect(() => {
      throw new ValidationError('Custom Validator Error Message')
    }).toThrow(ValidationError)
  })

  it('should have name equal to "ValidationError"', () => {
    try {
      throw new ValidationError('Custom Validator Error Message')
    } catch (error) {
      expect(error.name).toBe('ValidationError');
    }
  })

  it('should include error message when one is passed', () => {
    expect(() => {
      throw new ValidationError('Custom Validator Error Message')
    }).toThrow('Custom Validator Error Message')
  })
})