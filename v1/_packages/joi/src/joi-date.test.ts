import { date, optionalDate } from './joi-date'

describe('joi-date', () => {
  describe('date', () => {
    it('should not accept null', () => {
      const value = null
      const schema = date()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should not accept undefined', () => {
      const value = undefined
      const schema = date()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept a date when a list of allowed values is not passed', () => {
      const value = new Date()
      const schema = date()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValues = [new Date(3), new Date(4)]
      const schema = date(...allowedValues)
      const resultOne = schema.validate(allowedValues[0])
      const resultTwo = schema.validate(allowedValues[1])
      expect(resultOne.error).toBeFalsy()
      expect(resultTwo.error).toBeFalsy()
    })
  })

  describe('optionalDate', () => {
    it('should not accept null', () => {
      const value = null
      const schema = optionalDate()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept undefined', () => {
      const value = undefined
      const schema = optionalDate()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept a date when a list of allowed values is not passed', () => {
      const value = new Date()
      const schema = optionalDate()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValues = [new Date(3), new Date(4)]
      const schema = optionalDate(...allowedValues)
      const resultOne = schema.validate(allowedValues[0])
      const resultTwo = schema.validate(allowedValues[1])
      expect(resultOne.error).toBeFalsy()
      expect(resultTwo.error).toBeFalsy()
    })
  })
})
