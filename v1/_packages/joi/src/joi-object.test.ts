import { boolean } from './joi-boolean'
import { date } from './joi-date'
import { number } from './joi-number'
import { object, optionalObject } from './joi-object'
import { string } from './joi-string'

describe('joi-object', () => {
  describe('object', () => {
    it('should not accept null', () => {
      const value = null
      const schema = object()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should not accept undefined', () => {
      const value = undefined
      const schema = object()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept objects that fit a given schema definition', () => {
      const value = {
        boolean: false,
        number: 123,
        string: '123',
        date: new Date(),
      }

      const schema = object({
        boolean: boolean(),
        number: number(),
        string: string(),
        date: date(),
      })

      const result = schema.validate(value)

      expect(result.error).toBeFalsy()
    })

    it('should accepts nested objects that fit a given schema definition', () => {
      const value = {
        object: {
          boolean: false,
          number: 123,
          string: '123',
          date: new Date(),
        },
      }

      const schema = object({
        object: object({
          boolean: boolean(),
          number: number(),
          string: string(),
          date: date(),
        }),
      })

      const result = schema.validate(value)

      expect(result.error).toBeFalsy()
    })
  })

  describe('optionalObject', () => {
    it('should not accept null', () => {
      const value = null
      const schema = optionalObject()
      const result = schema.validate(value)
      expect(result.error).toBeTruthy()
    })

    it('should accept undefined', () => {
      const value = undefined
      const schema = optionalObject()
      const result = schema.validate(value)
      expect(result.error).toBeFalsy()
    })

    it('should accept objects that fit a given schema definition', () => {
      const value = {
        object: {
          boolean: false,
          number: 123,
          string: '123',
          date: new Date(),
        },
      }

      const schema = object({
        object: object({
          boolean: boolean(),
          number: number(),
          string: string(),
          date: date(),
        }),
      })

      const result = schema.validate(value)

      expect(result.error).toBeFalsy()
    })

    it('should accepts nested objects that fit a given schema definition', () => {
      const value = {
        boolean: false,
        number: 123,
        string: '123',
        date: new Date(),
      }

      const schema = object({
        boolean: boolean(),
        number: number(),
        string: string(),
        date: date(),
      })

      const result = schema.validate(value)

      expect(result.error).toBeFalsy()
    })
  })
})
