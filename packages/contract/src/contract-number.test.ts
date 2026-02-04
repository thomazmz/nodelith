import { $Number } from './contract-number'

describe('$Number', () => {
  describe('parse', () => {
    const contract = $Number.create({ optional: false, nullable: false })

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

    test('accepts finite numbers', () => {
      const result = contract.parse(123.5)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(123.5)
    })

    test('accepts Infinity', () => {
      const result = contract.parse(Infinity)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(Infinity)
    })

    test('accepts -Infinity', () => {
      const result = contract.parse(-Infinity)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(-Infinity)
    })

    test('accepts NaN', () => {
      const result = contract.parse(NaN)
      expect(result.success).toBe(true)
      if (result.success) expect(Number.isNaN(result.value)).toBe(true)
    })

    test('rejects boolean', () => {
      const result = contract.parse(true)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects numeric string', () => {
      const result = contract.parse('123.5')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects bigint', () => {
      const result = contract.parse(123n)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects objects', () => {
      const result = contract.parse({ a: 1 })
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('accepts undefined when optional=true nullable=false', () => {
      const contract = $Number.create({ optional: true, nullable: false })
      const result = contract.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('accepts null when optional=false nullable=true', () => {
      const contract = $Number.create({ optional: false, nullable: true })
      const result = contract.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })

    test('accepts undefined and null when optional=true nullable=true', () => {
      const contract = $Number.create({ optional: true, nullable: true })

      const a = contract.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = contract.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)
    })
  })

  describe('normalize', () => {
    const contract = $Number.create({ optional: false, nullable: false })

    test('normalizes boolean true to 1', () => {
      const result = contract.normalize(true)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(1)
    })

    test('normalizes boolean false to 0', () => {
      const result = contract.normalize(false)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(0)
    })

    test('normalizes numeric string to number', () => {
      const result = contract.normalize('123.5')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(123.5)
    })

    test('rejects non-numeric string', () => {
      const result = contract.normalize('abc')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('normalizes bigint within safe integer range to number', () => {
      const result = contract.normalize(123n)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(123)
    })

    test('rejects bigint outside safe integer range', () => {
      const tooLarge = BigInt(Number.MAX_SAFE_INTEGER) + 1n
      const result = contract.normalize(tooLarge)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('still accepts numbers (including NaN/Infinity)', () => {
      expect(contract.normalize(1).success).toBe(true)
      expect(contract.normalize(Infinity).success).toBe(true)
      expect(contract.normalize(-Infinity).success).toBe(true)
      expect(contract.normalize(NaN).success).toBe(true)
    })
  })
})
