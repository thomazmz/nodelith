import { boolean, optionalBoolean } from './joi-boolean'

describe('joi-boolean', () => {
  describe('boolean', () => {
    it('should not accept null', () => {
      const value = null
      const schema = boolean()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should not accept undefined', () => {
      const value = undefined
      const schema = boolean()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept true when a list of allowed values is not passed', () => {
      const value = true
      const schema = boolean()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept false when a list of allowed values is not passed', () => {
      const value = false
      const schema = boolean()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValuesTrue = [true]
      const schemaTrue = boolean(...allowedValuesTrue)
      const resultTrue = schemaTrue.validate(true)
      expect(resultTrue.error).toBeFalsy()

      const allowedValuesFalse = [false]
      const schemaFalse = boolean(...allowedValuesFalse)
      const resultFalse = schemaFalse.validate(false)
      expect(resultFalse.error).toBeFalsy()

      const allowedValuesBoolean = [true, false]
      const schemaBoolean = boolean(...allowedValuesBoolean)

      const resultBooleanTrue = schemaBoolean.validate(true)
      expect(resultBooleanTrue.error).toBeFalsy()

      const resultBooleanFalse = schemaBoolean.validate(false)
      expect(resultBooleanFalse.error).toBeFalsy()
    })
  })

  describe('optionalBoolean', () => {
    it('should not accept null', () => {
      const value = null
      const schema = optionalBoolean()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept undefined', () => {
      const value = undefined
      const schema = optionalBoolean()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept true when a list of allowed values is not passed', () => {
      const value = true
      const schema = optionalBoolean()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept false when a list of allowed values is not passed', () => {
      const value = false
      const schema = optionalBoolean()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept all allowed values when a list of allowed values is passed', () => {
      const allowedValuesTrue = [true]
      const schemaTrue = boolean(...allowedValuesTrue)
      const resultTrue = schemaTrue.validate(true)
      expect(resultTrue.error).toBeFalsy()

      const allowedValuesFalse = [false]
      const schemaFalse = boolean(...allowedValuesFalse)
      const resultFalse = schemaFalse.validate(false)
      expect(resultFalse.error).toBeFalsy()

      const allowedValuesBoolean = [true, false]
      const schemaBoolean = boolean(...allowedValuesBoolean)

      const resultBooleanTrue = schemaBoolean.validate(true)
      expect(resultBooleanTrue.error).toBeFalsy()

      const resultBooleanFalse = schemaBoolean.validate(false)
      expect(resultBooleanFalse.error).toBeFalsy()
    })
  })
})
