import { array } from './joi-array'
import { string } from './joi-string'

describe('joi-array', () => {
  describe('array', () => {
    it('should not accept null', () => {
      const value = null
      const schema = array()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should not accept undefined', () => {
      const value = undefined
      const schema = array()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept an array wiht multiple types when no schema is passed', () => {
      const value = ['string', 123, {}]
      const schema = array()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should only accept values that fulfill a given schema', () => {
      const schema = array(string())

      const firtValue = ['someArrayValue', 'anotherArrayValue']
      const firstResult = schema.validate(firtValue)
      expect(firstResult.error).toBeFalsy()

      const secondValue = ['someArrayValue', 123]
      const secondResult = schema.validate(secondValue)
      expect(secondResult.error).toBeTruthy()
    })
  })

  describe('arrayOptional', () => {
    it('should not accept null', () => {
      const value = null
      const schema = array()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept an array wiht multiple types when no schema is passed', () => {
      const value = ['string', 123, {}]
      const schema = array()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should only accept values that fulfill a given schema', () => {
      const schema = array(string())

      const firtValue = ['someArrayValue', 'anotherArrayValue']
      const firstResult = schema.validate(firtValue)
      expect(firstResult.error).toBeFalsy()

      const secondValue = ['someArrayValue', 123]
      const secondResult = schema.validate(secondValue)
      expect(secondResult.error).toBeTruthy()
    })
  })
})
