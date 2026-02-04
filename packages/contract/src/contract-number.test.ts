import { $Number } from './contract-number'

describe.only('contract-number', () => {
  const contract = $Number.create({ optional: false, nullable: false })

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

  test('accepts finite numbers', () => {
    const result = contract.parse(123.5)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(123.5)
  })

  test('accepts Infinity', () => {
    const result = contract.parse(Infinity)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(Infinity)
  })

  test('accepts -Infinity', () => {
    const result = contract.parse(-Infinity)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(-Infinity)
  })

  test('accepts NaN', () => {
    const result = contract.parse(NaN)
    expect(result.success).toBe(true)
    if(!result.success) expect(result.issues.length).toBe(NaN)
  })

  test('coerces boolean true to 1', () => {
    const result = contract.parse(true)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(1)
  })

  test('coerces boolean false to 0', () => {
    const result = contract.parse(false)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(0)
  })

  test('rejects empty string', () => {
    const result = contract.parse('   ')
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('coerces numeric string to number', () => {
    const result = contract.parse('123.5')
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(123.5)
  })

  test('rejects non-numeric string', () => {
    const result = contract.parse('abc')
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('coerces bigint within safe integer range to number', () => {
    const result = contract.parse(123n)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(123)
  })

  test('rejects bigint outside safe integer range', () => {
    const tooLarge = BigInt(Number.MAX_SAFE_INTEGER) + 1n
    const result = contract.parse(tooLarge)
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('rejects objects', () => {
    const result = contract.parse({ a: 1 })
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })
})
