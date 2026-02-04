import { $Boolean } from './contract-boolean'

describe('$Boolean', () => {
  describe('parse', () => {
    const contract = $Boolean.create({ optional: false, nullable: false })

    test('fails for undefined when not optional', () => {
      const result = contract.parse(undefined)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('fails for null when not nullable', () => {
      const result = contract.parse(null)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('accepts boolean true', () => {
      const result = contract.parse(true)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(true)
    })

    test('accepts boolean false', () => {
      const result = contract.parse(false)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(false)
    })

    test('rejects strings', () => {
      const result = contract.parse('true')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects numbers', () => {
      const result = contract.parse(1)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects bigints', () => {
      const result = contract.parse(1n)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true allows undefined', () => {
      const contract = $Boolean.create({ optional: true, nullable: false })
      const result = contract.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const contract = $Boolean.create({ optional: false, nullable: true })
      const result = contract.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })
  })

  describe('normalize', () => {
    const contract = $Boolean.create({ optional: false, nullable: false })

    test('normalizes string "true" to true', () => {
      const result = contract.normalize('true')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(true)
    })

    test('normalizes string "false" to false', () => {
      const result = contract.normalize('false')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(false)
    })

    test('normalizes string "1" to true', () => {
      const result = contract.normalize('1')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(true)
    })

    test('normalizes string "0" to false', () => {
      const result = contract.normalize('0')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(false)
    })

    test('rejects other strings', () => {
      const result = contract.normalize('yes')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('normalizes number 1 to true', () => {
      const result = contract.normalize(1)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(true)
    })

    test('normalizes number 0 to false', () => {
      const result = contract.normalize(0)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(false)
    })

    test('rejects other numbers', () => {
      const result = contract.normalize(2)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('normalizes bigint 1n to true', () => {
      const result = contract.normalize(1n)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(true)
    })

    test('normalizes bigint 0n to false', () => {
      const result = contract.normalize(0n)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(false)
    })

    test('rejects other bigints', () => {
      const result = contract.normalize(2n)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })
  })
})
