import { ContractValue } from './contract-value'

describe('ContractValue', () => {
  it('should attach metadata to null schema', () => {
    const schema = ContractValue.null({
      example: null,
      description: 'A null value',
    })

    expect(schema.meta()).toEqual({
      example: null,
      description: 'A null value',
    })
  })

  it('should attach metadata to boolean schema', () => {
    const schema = ContractValue.boolean({
      example: true,
      description: 'A boolean value',
    })

    expect(schema.meta()).toEqual({
      example: true,
      description: 'A boolean value',
    })
  })

  it('should attach metadata to number schema', () => {
    const schema = ContractValue.number({
      example: 42,
      description: 'A number value',
    })

    expect(schema.meta()).toEqual({
      example: 42,
      description: 'A number value',
    })
  })

  it('should attach metadata to string schema', () => {
    const schema = ContractValue.string({
      example: 'hello',
      description: 'A string value',
    })

    expect(schema.meta()).toEqual({
      example: 'hello',
      description: 'A string value',
    })
  })

  it('should support chaining string with default', () => {
    const schema = ContractValue.string({
      example: 'hello',
      description: 'A string value',
    }).default('default-value')

    expect(schema).toBeDefined()
  })

  it('should attach metadata to date schema', () => {
    const schema = ContractValue.date({
      example: '2023-01-01T00:00:00Z',
      description: 'A date value',
    })

    expect(schema.meta()).toEqual({
      example: '2023-01-01T00:00:00Z',
      description: 'A date value',
    })
  })

  it('should attach metadata to email schema', () => {
    const schema = ContractValue.email({
      example: 'test@example.com',
      description: 'An email value',
    })

    expect(schema.meta()).toEqual({
      example: 'test@example.com',
      description: 'An email value',
    })
  })

  it('should attach metadata to string literal schema', () => {
    const schema = ContractValue.literal('active', {
      example: 'active',
      description: 'A literal value',
    })

    expect(schema.meta()).toEqual({
      example: 'active',
      description: 'A literal value',
    })
  })

  it('should attach metadata to number literal schema', () => {
    const schema = ContractValue.literal(42, {
      example: 42,
      description: 'The answer',
    })

    expect(schema.meta()).toEqual({
      example: 42,
      description: 'The answer',
    })
  })

  it('should attach metadata to boolean literal schema', () => {
    const schema = ContractValue.literal(true, {
      example: true,
      description: 'Always true',
    })

    expect(schema.meta()).toEqual({
      example: true,
      description: 'Always true',
    })
  })

  it('should attach metadata to null literal schema', () => {
    const schema = ContractValue.literal(null, {
      example: null,
      description: 'Always null',
    })

    expect(schema.meta()).toEqual({
      example: null,
      description: 'Always null',
    })
  })

  it('should attach metadata to enum schema', () => {
    const schema = ContractValue.enum(['active', 'inactive', 'pending'], {
      example: 'active',
      description: 'Status enum',
    })

    expect(schema.meta()).toEqual({
      example: 'active',
      description: 'Status enum',
    })
  })
})

