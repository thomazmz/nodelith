import { $String } from './contract-string'

describe('contract-string', () => {
  const contract = $String.create({ optional: false, nullable: false })

  test('fails for undefined when not optional', () => {
    const result = contract.parse(undefined)
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('fails for null when not nullable', () => {
    const result = contract.parse(null)
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('accepts strings', () => {
    const result = contract.parse('hello')
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe('hello')
  })

  test('coerces finite numbers to string', () => {
    const result = contract.parse(123.5)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe('123.5')
  })

  test('rejects Infinity', () => {
    const result = contract.parse(Infinity)
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('rejects NaN', () => {
    const result = contract.parse(NaN)
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('coerces bigint to string', () => {
    const result = contract.parse(123n)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe('123')
  })

  test('coerces boolean true to "true"', () => {
    const result = contract.parse(true)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe('true')
  })

  test('coerces boolean false to "false"', () => {
    const result = contract.parse(false)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe('false')
  })

  test('rejects objects', () => {
    const result = contract.parse({ a: 1 })
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('accepts undefined when optional=true nullable=false', () => {
    const contract = $String.create({ optional: true, nullable: false })
    const result = contract.parse(undefined)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(undefined)
  })

  test('fails for null when optional=true nullable=false', () => {
    const contract = $String.create({ optional: true, nullable: false })
    const result = contract.parse(null)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('accepts null when optional=false nullable=true', () => {
    const contract = $String.create({ optional: false, nullable: true })
    const result = contract.parse(null)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(null)
  })

  test('fails for undefined when optional=false nullable=true', () => {
    const contract = $String.create({ optional: false, nullable: true })
    const result = contract.parse(undefined)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('accepts undefined when optional=true nullable=true', () => {
    const contract = $String.create({ optional: true, nullable: true })
    const result = contract.parse(undefined)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(undefined)
  })

  test('accepts null when optional=true nullable=true', () => {
    const contract = $String.create({ optional: true, nullable: true })
    const result = contract.parse(null)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(null)
  })
})
