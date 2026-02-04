import { $String } from './contract-string'

describe('$String', () => {
  describe('parse (strict)', () => {
    const contract = $String.create({ optional: false, nullable: false })

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

    test('accepts strings', () => {
      const result = contract.parse('hello')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('hello')
    })

    test('rejects numbers', () => {
      const result = contract.parse(123)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects booleans', () => {
      const result = contract.parse(true)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects bigint', () => {
      const result = contract.parse(1n)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true allows undefined', () => {
      const contract = $String.create({ optional: true, nullable: false })
      const result = contract.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const contract = $String.create({ optional: false, nullable: true })
      const result = contract.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })
  })

  describe('normalize (coercing)', () => {
    const contract = $String.create({ optional: false, nullable: false })

    test('coerces finite numbers to string', () => {
      const result = contract.normalize(123.5)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('123.5')
    })

    test('rejects Infinity', () => {
      const result = contract.normalize(Infinity)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects -Infinity', () => {
      const result = contract.normalize(-Infinity)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects NaN', () => {
      const result = contract.normalize(NaN)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('coerces bigint to string', () => {
      const result = contract.normalize(123n)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('123')
    })

    test('coerces boolean true/false to "true"/"false"', () => {
      const a = contract.normalize(true)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('true')

      const b = contract.normalize(false)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe('false')
    })
  })
})
