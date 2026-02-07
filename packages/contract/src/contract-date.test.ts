// contract-date.spec.ts
import { $Date } from './contract-date'

describe('$Date', () => {
  describe('parse', () => {
    const contract = $Date.create({ optional: false, nullable: false })

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

    test('accepts valid Date values', () => {
      const input = new Date('2026-02-06T12:34:56.789Z')
      const result = contract.parse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeInstanceOf(Date)
        expect(result.value.getTime()).toBe(input.getTime())
      }
    })

    test('clones Date values (different ref, same time)', () => {
      const input = new Date('2026-02-06T12:34:56.789Z')
      const result = contract.parse(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).not.toBe(input)
        expect(result.value.getTime()).toBe(input.getTime())
      }
    })

    test('rejects Invalid Date values', () => {
      const input = new Date('not-a-date')
      const result = contract.parse(input)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects strings', () => {
      const result = contract.parse('2026-02-06T12:34:56.789Z')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects numbers', () => {
      const result = contract.parse(1700000000000)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects bigints', () => {
      const result = contract.parse(1700000000000n)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects booleans', () => {
      const result = contract.parse(true)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects objects', () => {
      const result = contract.parse({})
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects arrays', () => {
      const result = contract.parse([])
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects functions', () => {
      const result = contract.parse(() => {})
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true allows undefined', () => {
      const contract = $Date.create({ optional: true, nullable: false })
      const result = contract.parse(undefined)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const contract = $Date.create({ optional: false, nullable: true })
      const result = contract.parse(null)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })
  })

  describe('normalize', () => {
    const contract = $Date.create({ optional: false, nullable: false })

    test('accepts valid Date values', () => {
      const input = new Date('2026-02-06T12:34:56.789Z')
      const result = contract.normalize(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeInstanceOf(Date)
        expect(result.value.getTime()).toBe(input.getTime())
      }
    })

    test('clones Date values (different ref, same time)', () => {
      const input = new Date('2026-02-06T12:34:56.789Z')
      const result = contract.normalize(input)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).not.toBe(input)
        expect(result.value.getTime()).toBe(input.getTime())
      }
    })

    test('rejects Invalid Date values', () => {
      const input = new Date('not-a-date')
      const result = contract.normalize(input)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('normalizes number timestamp (ms) into a Date', () => {
      const ts = 1700000000000
      const result = contract.normalize(ts)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeInstanceOf(Date)
        expect(result.value.getTime()).toBe(ts)
      }
    })

    test('normalizes bigint timestamp (ms) into a Date', () => {
      const ts = 1700000000000n
      const result = contract.normalize(ts)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeInstanceOf(Date)
        expect(result.value.getTime()).toBe(Number(ts))
      }
    })

    test('normalizes ISO string into a Date', () => {
      const iso = '2026-02-06T12:34:56.789Z'
      const result = contract.normalize(iso)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toBeInstanceOf(Date)
        expect(result.value.getTime()).toBe(new Date(iso).getTime())
      }
    })

    test('rejects invalid strings', () => {
      const result = contract.normalize('not-a-date')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects booleans', () => {
      const result = contract.normalize(true)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects objects', () => {
      const result = contract.normalize({})
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects arrays', () => {
      const result = contract.normalize([])
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects functions', () => {
      const result = contract.normalize(() => {})
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true allows undefined', () => {
      const contract = $Date.create({ optional: true, nullable: false })
      const result = contract.normalize(undefined)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const contract = $Date.create({ optional: false, nullable: true })
      const result = contract.normalize(null)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })
  })
})
