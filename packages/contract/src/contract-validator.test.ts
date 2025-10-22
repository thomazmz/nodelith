import z from 'zod'
import { randomUUID } from 'crypto'
import { ContractValidator } from './contract-validator'

describe('ContractValidator', () => {
  it('should validate valid data and return tuple with data', () => {
    const schema = z.string()
    const validator = ContractValidator.create(schema, 'body')
    
    const result = validator.validate('test')
    
    expect(result).toEqual(['test', undefined])
  })

  it('should validate invalid data and return tuple with error', () => {
    const schema = z.string()
    const validator = ContractValidator.create(schema)
    
    const result = validator.validate(123)
    
    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "number" while expecting "string".`)
  })

  it('should validate string schema when string is passed', () => {
    const schema = z.string()
    const validator = ContractValidator.create(schema)
    
    const result = validator.validate('123')
    
    expect(result[0]).toBe('123')
  })

  it('should not validate string schema when invalid string is passed', () => {
    const schema = z.string()
    const validator = ContractValidator.create(schema)

    const result = validator.validate(123)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "number" while expecting "string".`)
  })

  it('should not validate string schema (with root) when invalid string is passed', () => {
    const schema = z.string()
    const validator = ContractValidator.create(schema, 'root')

    const result = validator.validate(123)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "number" as "root" while expecting "string".`)
  })

  it('should not validate string schema (with refference) when invalid string is passed', () => {
    const refference = randomUUID()
    const schema = z.string().meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate(123)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "number" while expecting "string".`)
  })

  it('should not validate string schema (with root and refference) when invalid string is passed', () => {
    const refference = randomUUID()
    const schema = z.string().meta({ id: refference })
    const validator = ContractValidator.create(schema, "body")

    const result = validator.validate(123)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "number" as "body" while expecting "string".`)
  })

  it('should validate number schema when number is passed', () => {
    const schema = z.number()
    const validator = ContractValidator.create(schema)
    
    const result = validator.validate(123)
    
    expect(result[0]).toBe(123)
  })

  it('should not validate number schema when invalid number is passed', () => {
    const schema = z.number()
    const validator = ContractValidator.create(schema)

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" while expecting "number".`)
  })

  it('should not validate number schema (with root) when invalid number is passed', () => {
    const schema = z.number()
    const validator = ContractValidator.create(schema, 'root')

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" as "root" while expecting "number".`)
  })

  it('should not validate number schema (with refference) when invalid number is passed', () => {
    const refference = randomUUID()
    const schema = z.number().meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" while expecting "number".`)
  })

  it('should not validate number schema (with root and refference) when invalid number is passed', () => {
    const refference = randomUUID()
    const schema = z.number().meta({ id: refference })
    const validator = ContractValidator.create(schema, "body")

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" as "body" while expecting "number".`)
  })

  it('should validate boolean schema when boolean is passed', () => {
    const schema = z.boolean()
    const validator = ContractValidator.create(schema)
    
    const result = validator.validate(true)
    
    expect(result[0]).toBe(true)
  })

  it('should not validate boolean schema when invalid boolean is passed', () => {
    const schema = z.boolean()
    const validator = ContractValidator.create(schema)

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" while expecting "boolean".`)
  })

  it('should not validate boolean schema (with root) when invalid boolean is passed', () => {
    const schema = z.boolean()
    const validator = ContractValidator.create(schema, 'root')

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" as "root" while expecting "boolean".`)
  })

  it('should not validate boolean schema (with refference) when invalid boolean is passed', () => {
    const refference = randomUUID()
    const schema = z.boolean().meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" while expecting "boolean".`)
  })

  it('should not validate boolean schema (with root and refference) when invalid boolean is passed', () => {
    const refference = randomUUID()
    const schema = z.boolean().meta({ id: refference })
    const validator = ContractValidator.create(schema, "body")

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" as "body" while expecting "boolean".`)
  })

  it('should validate null schema when null is passed', () => {
    const schema = z.null()
    const validator = ContractValidator.create(schema)
    
    const result = validator.validate(null)
    
    expect(result[0]).toBe(null)
  })

  it('should not validate null schema when invalid null is passed', () => {
    const schema = z.null()
    const validator = ContractValidator.create(schema)

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" while expecting "null".`)
  })

  it('should not validate null schema (with root) when invalid null is passed', () => {
    const schema = z.null()
    const validator = ContractValidator.create(schema, 'root')

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" as "root" while expecting "null".`)
  })

  it('should not validate null schema (with refference) when invalid null is passed', () => {
    const refference = randomUUID()
    const schema = z.null().meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" while expecting "null".`)
  })

  it('should not validate null schema (with root and refference) when invalid null is passed', () => {
    const refference = randomUUID()
    const schema = z.null().meta({ id: refference })
    const validator = ContractValidator.create(schema, "body")

    const result = validator.validate('123')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" as "body" while expecting "null".`)
  })

  it('should not validate when values are undefined', () => {
    const schema = z.string()
    const validator = ContractValidator.create(schema)

    const result = validator.validate(undefined)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value is missing.`)
  })

  it('should not validate when values are undefined (with root)', () => {
    const schema = z.string()
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(undefined)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" is missing.`)
  })

  it('should not validate when values are undefined (with reference)', () => {
    const refference = randomUUID()
    const schema = z.string().meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate(undefined)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value is missing.`)
  })

  it('should not validate when values are undefined (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.string().meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(undefined)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" is missing.`)
  })

  it('should not validate when object values are undefined', () => {
    const schema = z.object({
      key: z.string()
    })

    const validator = ContractValidator.create(schema)
    const result = validator.validate({
      key: undefined
    })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "key" is missing.`)
  })

  it('should not validate when object values are undefined (with root)', () => {
    const schema = z.object({
      key: z.string()
    })

    const validator = ContractValidator.create(schema, 'body')
    const result = validator.validate({ })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body.key" is missing.`)
  })

  it('should not validate when object values are undefined (with reference)', () => {
    const refference = randomUUID()

    const schema = z.object({
      key: z.string()
    }).meta({ id: refference })

    const validator = ContractValidator.create(schema)
    const result = validator.validate({ })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "key" is missing.`)
  })

  it('should not validate when object values are undefined (with root and reference)', () => {
    const refference = randomUUID()

    const schema = z.object({
      key: z.string()
    }).meta({ id: refference })

    const validator = ContractValidator.create(schema, 'body')
    const result = validator.validate({ })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body.key" is missing.`)
  })

  it('should not validate value with invalid key', () => {
    const schema = z.object({ name: z.string() }).strict()
    const validator = ContractValidator.create(schema)

    const result = validator.validate({ name: 'test', extra: 'field' })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received an invalid key "extra".`)
  })

  it('should not validate value with invalid key (with root)', () => {
    const schema = z.object({ name: z.string() }).strict()
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate({ name: 'test', extra: 'field' })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received an invalid key "extra" in "body".`)
  })

  it('should not validate value with invalid key (with reference)', () => {
    const refference = randomUUID()
    const schema = z.object({ name: z.string() }).strict().meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate({ name: 'test', extra: 'field' })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received an invalid key "extra".`)
  })

  it('should not validate with single unrecognized key (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.object({ name: z.string() }).strict().meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate({ name: 'test', extra: 'field' })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received an invalid key "extra" in "body".`)
  })

  it('should not validate invalid literal (no root, no reference)', () => {
    const schema = z.literal('active')
    const validator = ContractValidator.create(schema)

    const result = validator.validate('inactive')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value must be "active".`)
  })

  it('should not validate invalid literal (with root, no reference)', () => {
    const schema = z.literal('active')
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('inactive')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be "active".`)
  })

  it('should not validate invalid literal (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.literal('active').meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('inactive')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value must be "active".`)
  })

  it('should not validate invalid literal (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.literal('active').meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('inactive')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" must be "active".`)
  })

  it('should not validate invalid enum value (no root, no reference)', () => {
    const schema = z.enum(['active', 'inactive', 'pending'])
    const validator = ContractValidator.create(schema)

    const result = validator.validate('unknown')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value must be "active".`)
  })

  it('should not validate invalid enum value (with root, no reference)', () => {
    const schema = z.enum(['active', 'inactive', 'pending'])
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('unknown')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be "active".`)
  })

  it('should not validate invalid enum value (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.enum(['active', 'inactive', 'pending']).meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('unknown')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value must be "active".`)
  })

  it('should not validate invalid enum value (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.enum(['active', 'inactive', 'pending']).meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('unknown')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" must be "active".`)
  })

  it('should not validate string too_small (no root, no reference)', () => {
    const schema = z.string().min(5)
    const validator = ContractValidator.create(schema)

    const result = validator.validate('abc')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value must be at least 5 characters long.`)
  })

  it('should not validate string too_small (with root, no reference)', () => {
    const schema = z.string().min(5)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('abc')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be at least 5 characters long.`)
  })

  it('should not validate string too_small (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.string().min(5).meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('abc')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value must be at least 5 characters long.`)
  })

  it('should not validate string too_small (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.string().min(5).meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('abc')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" must be at least 5 characters long.`)
  })

  it('should not validate string too_small single character (with root)', () => {
    const schema = z.string().min(1)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be at least 1 character long.`)
  })

  it('should not validate number too_small inclusive (no root, no reference)', () => {
    const schema = z.number().min(10)
    const validator = ContractValidator.create(schema)

    const result = validator.validate(5)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value must be a number at least 10.`)
  })

  it('should not validate number too_small inclusive (with root, no reference)', () => {
    const schema = z.number().min(10)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(5)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be a number at least 10.`)
  })

  it('should not validate number too_small inclusive (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.number().min(10).meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate(5)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value must be a number at least 10.`)
  })

  it('should not validate number too_small inclusive (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.number().min(10).meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(5)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" must be a number at least 10.`)
  })

  it('should not validate number too_small exclusive (with root)', () => {
    const schema = z.number().gt(10)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(10)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be a number greater than 10.`)
  })

  it('should not validate string too_big (no root, no reference)', () => {
    const schema = z.string().max(5)
    const validator = ContractValidator.create(schema)

    const result = validator.validate('abcdefgh')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value must be at most 5 characters long.`)
  })

  it('should not validate string too_big (with root, no reference)', () => {
    const schema = z.string().max(5)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('abcdefgh')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be at most 5 characters long.`)
  })

  it('should not validate string too_big (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.string().max(5).meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('abcdefgh')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value must be at most 5 characters long.`)
  })

  it('should not validate string too_big (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.string().max(5).meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('abcdefgh')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" must be at most 5 characters long.`)
  })

  it('should not validate string too_big single character (with root)', () => {
    const schema = z.string().max(1)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('ab')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be at most 1 character long.`)
  })

  it('should not validate number too_big inclusive (no root, no reference)', () => {
    const schema = z.number().max(10)
    const validator = ContractValidator.create(schema)

    const result = validator.validate(15)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value must be a number at most 10.`)
  })

  it('should not validate number too_big inclusive (with root, no reference)', () => {
    const schema = z.number().max(10)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(15)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be a number at most 10.`)
  })

  it('should not validate number too_big inclusive (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.number().max(10).meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate(15)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value must be a number at most 10.`)
  })

  it('should not validate number too_big inclusive (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.number().max(10).meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(15)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" must be a number at most 10.`)
  })

  it('should not validate number too_big exclusive (with root)', () => {
    const schema = z.number().lt(10)
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate(10)

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" must be a number less than 10.`)
  })

  it('should not validate invalid format (no root, no reference)', () => {
    const schema = z.email()
    const validator = ContractValidator.create(schema)

    const result = validator.validate('not-an-email')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Value has invalid email format.`)
  })

  it('should not validate invalid format (with root, no reference)', () => {
    const schema = z.email()
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('not-an-email')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Field "body" has invalid email format.`)
  })

  it('should not validate invalid format (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.email().meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate('not-an-email')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Value has invalid email format.`)
  })

  it('should not validate invalid format (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.email().meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate('not-an-email')

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Field "body" has invalid email format.`)
  })

  it('should not validate invalid element (no root, no reference)', () => {
    const schema = z.array(z.number())
    const validator = ContractValidator.create(schema)

    const result = validator.validate([1, 2, 'three'])

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" as "[2]" while expecting "number".`)
  })

  it('should not validate invalid element (with root, no reference)', () => {
    const schema = z.array(z.number())
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate([1, 2, 'three'])

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" as "body[2]" while expecting "number".`)
  })

  it('should not validate invalid element (no root, with reference)', () => {
    const refference = randomUUID()
    const schema = z.array(z.number()).meta({ id: refference })
    const validator = ContractValidator.create(schema)

    const result = validator.validate([1, 2, 'three'])

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" as "[2]" while expecting "number".`)
  })

  it('should not validate invalid element (with root and reference)', () => {
    const refference = randomUUID()
    const schema = z.array(z.number()).meta({ id: refference })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate([1, 2, 'three'])

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. The operation requires a valid ${refference}. Received "string" as "body[2]" while expecting "number".`)
  })

  it('should not validate invalid nested array element (with root)', () => {
    const schema = z.object({
      items: z.array(z.number())
    })
    const validator = ContractValidator.create(schema, 'body')

    const result = validator.validate({ items: [1, 2, 'three'] })

    expect(result[0]).toBeUndefined()
    expect(result[1]).toBe(`Invalid contract. Received "string" as "body.items[2]" while expecting "number".`)
  })
})
