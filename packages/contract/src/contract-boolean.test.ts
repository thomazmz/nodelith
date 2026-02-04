import { $Boolean } from './contract-boolean'

describe('contract-boolean', () => {
  const contract = $Boolean.create({ optional: false, nullable: false })

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

  test('accepts boolean true', () => {
    const result = contract.parse(true)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(true)
  })

  test('accepts boolean false', () => {
    const result = contract.parse(false)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(false)
  })

  test('parses string "true" to true', () => {
    const result = contract.parse('true')
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(true)
  })

  test('parses string "false" to false', () => {
    const result = contract.parse('false')
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(false)
  })

  test('parses string "1" to true', () => {
    const result = contract.parse('1')
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(true)
  })

  test('parses string "0" to false', () => {
    const result = contract.parse('0')
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(false)
  })

  test('rejects other strings', () => {
    const result = contract.parse('yes')
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('parses number 1 to true', () => {
    const result = contract.parse(1)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(true)
  })

  test('parses number 0 to false', () => {
    const result = contract.parse(0)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(false)
  })

  test('rejects other numbers', () => {
    const result = contract.parse(2)
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('parses bigint 1n to true', () => {
    const result = contract.parse(1n)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(true)
  })

  test('parses bigint 0n to false', () => {
    const result = contract.parse(0n)
    expect(result.success).toBe(true)
    if(result.success) expect(result.value).toBe(false)
  })

  test('rejects other bigints', () => {
    const result = contract.parse(2n)
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('rejects objects', () => {
    const result = contract.parse({ a: 1 })
    expect(result.success).toBe(false)
    if(!result.success) expect(result.issues.length).toBeGreaterThan(0)
  })

  test('accepts boolean true when optional=true nullable=false', () => {
    const contract = $Boolean.create({ optional: true, nullable: false })
    const result = contract.parse(true)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(true)
  })

  test('accepts boolean false when optional=true nullable=false', () => {
    const contract = $Boolean.create({ optional: true, nullable: false })
    const result = contract.parse(false)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(false)
  })

  test('accepts boolean true when optional=false nullable=true', () => {
    const contract = $Boolean.create({ optional: false, nullable: true })
    const result = contract.parse(true)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(true)
  })

  test('accepts boolean false when optional=false nullable=true', () => {
    const contract = $Boolean.create({ optional: false, nullable: true })
    const result = contract.parse(false)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(false)
  })

  test('accepts boolean true when optional=true nullable=true', () => {
    const contract = $Boolean.create({ optional: true, nullable: true })
    const result = contract.parse(true)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(true)
  })

  test('accepts boolean false when optional=true nullable=true', () => {
    const contract = $Boolean.create({ optional: true, nullable: true })
    const result = contract.parse(false)
    expect(result.success).toBe(true)
    if (result.success) expect(result.value).toBe(false)
  })
})
