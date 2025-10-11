import { number, optionalNumber } from './joi-number'

describe('joi-number', () => {
  describe('number', () => {
    it('should not accept null', () => {
      const value = null
      const schema = number()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should not accept undefined', () => {
      const value = undefined
      const schema = number()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept a number when a list of allowed values is not passed', () => {
      const value = 1
      const schema = number()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValues = [3, 4]
      const schema = number(...allowedValues)
      const resultOne = schema.validate(allowedValues[0])
      const resultTwo = schema.validate(allowedValues[1])
      expect(resultOne.error).toBeFalsy()
      expect(resultTwo.error).toBeFalsy()
    })
  })

  describe('optionalNumber', () => {
    it('should not accept null', () => {
      const value = null
      const schema = optionalNumber()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept undefined', () => {
      const value = undefined
      const schema = optionalNumber()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept a number when a list of allowed values is not passed', () => {
      const value = 1
      const schema = optionalNumber()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValues = [3, 4]
      const schema = optionalNumber(...allowedValues)
      const resultOne = schema.validate(allowedValues[0])
      const resultTwo = schema.validate(allowedValues[1])
      expect(resultOne.error).toBeFalsy()
      expect(resultTwo.error).toBeFalsy()
    })
  })
})
