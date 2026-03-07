
import { $Date } from './contract-date'

describe('$Date', () => {
  describe('schema', () => {
    test('produces a JSON schema', () => {
      const contract = $Date.create({ optional: false, nullable: false })
      expect(contract.schema).toEqual({ type: 'string', format: 'iso8601' })
    })

    test('nullable=true includes null in type', () => {
      const contract = $Date.create({ optional: false, nullable: true })
      expect(contract.schema).toEqual({ type: ['string', 'null'], format: 'iso8601' })
    })
  })

  describe('parse', () => {
    const contract = $Date.create({ optional: false, nullable: false })

    test('accepts valid Date instance', () => {
      const date = new Date()
      const result = contract.parse(date)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(date)
    })

    test('fails for invalid Date instance', () => {
      const date = new Date('invalid')
      const result = contract.parse(date)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

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

    test('optional=true allows undefined', () => {
      const opt = $Date.create({ optional: true, nullable: false })
      const result = opt.parse(undefined)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const nul = $Date.create({ optional: false, nullable: true })
      const result = nul.parse(null)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })

    test('optional=true does NOT allow null', () => {
      const opt = $Date.create({ optional: true, nullable: false })
      const result = opt.parse(null)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('nullable=true does NOT allow undefined', () => {
      const nul = $Date.create({ optional: false, nullable: true })
      const result = nul.parse(undefined)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true + nullable=true allows both undefined and null', () => {
      const both = $Date.create({ optional: true, nullable: true })

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)
    })

    test('rejects non-date types', () => {
      const a = contract.parse('2020-01-01')
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.parse(123)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = contract.parse({})
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)

      const d = contract.parse([])
      expect(d.success).toBe(false)
      if (!d.success) expect(d.issues.length).toBeGreaterThan(0)

      const e = contract.parse(Symbol('x'))
      expect(e.success).toBe(false)
      if (!e.success) expect(e.issues.length).toBeGreaterThan(0)
    })
  })

  describe('coerce', () => {
    const contract = $Date.create({ optional: false, nullable: false })

    test('passes through valid Date unchanged', () => {
      const date = new Date()
      const result = contract.coerce(date)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(date)
    })

    test('coerces valid ISO string', () => {
      const result = contract.coerce('2020-01-01T00:00:00.000Z')

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBeInstanceOf(Date)
    })

    test('coerces timestamp number', () => {
      const now = Date.now()
      const result = contract.coerce(now)

      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBeInstanceOf(Date)
    })

    test('rejects invalid string', () => {
      const result = contract.coerce('not-a-date')

      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects invalid number', () => {
      const result = contract.coerce(NaN)

      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('undefined/null still follow optional/nullable rules', () => {
      const baseU = contract.coerce(undefined)
      expect(baseU.success).toBe(false)
      if (!baseU.success) expect(baseU.issues.length).toBeGreaterThan(0)

      const baseN = contract.coerce(null)
      expect(baseN.success).toBe(false)
      if (!baseN.success) expect(baseN.issues.length).toBeGreaterThan(0)

      const both = $Date.create({ optional: true, nullable: true })

      const u = both.coerce(undefined)
      expect(u.success).toBe(true)
      if (u.success) expect(u.value).toBe(undefined)

      const n = both.coerce(null)
      expect(n.success).toBe(true)
      if (n.success) expect(n.value).toBe(null)
    })
  })

  describe('chaining', () => {
    test('optional() returns a new contract that allows undefined', () => {
      const base = $Date.create({ optional: false, nullable: false })
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $Date.create({ optional: false, nullable: false })
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $Date.create({ optional: true, nullable: true })
      const req = base.required()

      const a = req.parse(undefined)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = req.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = req.parse(new Date())
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBeInstanceOf(Date)
    })

    test('clone() with no args preserves behavior', () => {
      const base = $Date.create({ optional: false, nullable: false })
      const cloned = base.clone()

      const a = cloned.parse(new Date())
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBeInstanceOf(Date)

      const b = cloned.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('clone() can enable optional without affecting base', () => {
      const base = $Date.create({ optional: false, nullable: false })
      const cloned = base.clone({ optional: true })

      const a = cloned.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('optional() + nullable() chaining allows both undefined and null', () => {
      const base = $Date.create({ optional: false, nullable: false })
      const both = base.optional().nullable()

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)

      const c = both.parse(new Date())
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBeInstanceOf(Date)
    })
  })
})
