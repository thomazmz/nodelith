import { string, optionalString } from './joi-string'

describe('joi-string', () => {
  describe('string', () => {
    it('should not accept null', () => {
      const value = null
      const schema = string()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should not accept undefined', () => {
      const value = undefined
      const schema = string()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept a string when a list of allowed values is not passed', () => {
      const value = 'someString'
      const schema = string()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept empty string when a list with allowed values is not passed', () => {
      const value = ''
      const schema = string()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should not accept an empty string when a list of allowed values is passed', () => {
      const allowedValues = ['someAllowedValue', 'anotherAllowedValue']
      const value = ''
      const schema = string(...allowedValues)
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValues = ['someAllowedValue', 'anotherAllowedValue']
      const schema = string(...allowedValues)
      const resultOne = schema.validate(allowedValues[0])
      const resultTwo = schema.validate(allowedValues[1])
      expect(resultOne.error).toBeFalsy()
      expect(resultTwo.error).toBeFalsy()
    })
  })
  describe('optionalString', () => {
    it('should not accept null', () => {
      const value = null
      const schema = optionalString()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept undefined', () => {
      const value = undefined
      const schema = optionalString()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept a string when a list of allowed values is not passed', () => {
      const value = 'someString'
      const schema = optionalString()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept empty string when a list with allowed values is not passed', () => {
      const value = ''
      const schema = optionalString()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should not accept an empty string when a list of allowed values is passed', () => {
      const allowedValues = ['someAllowedValue', 'anotherAllowedValue']
      const value = ''
      const schema = optionalString(...allowedValues)
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValues = ['someAllowedValue', 'anotherAllowedValue']
      const schema = optionalString(...allowedValues)
      const resultOne = schema.validate(allowedValues[0])
      const resultTwo = schema.validate(allowedValues[1])
      expect(resultOne.error).toBeFalsy()
      expect(resultTwo.error).toBeFalsy()
    })
  })
})
