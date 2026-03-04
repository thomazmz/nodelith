import { $Array } from './contract-array'
import { $Number } from './contract-number'

describe('$Array', () => {
  describe('parse', () => {
    const item = $Number.create({ optional: false, nullable: false })
    const contract = $Array.create(item, { optional: false, nullable: false })

    test('accepts arrays when all items pass', () => {
      const a = contract.parse([123.5, 0, -10])
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toEqual([123.5, 0, -10])

      const b = contract.parse([])
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toEqual([])
    })

    test('is strict: does NOT coerce items', () => {
      const r = contract.parse(['123'])
      expect(r.success).toBe(false)
      if (!r.success) {
        expect(r.issues.length).toBeGreaterThan(0)
        const msg = String((r.issues[0] as any)?.message ?? r.issues[0])
        expect(msg).toContain('[0]:')
      }
    })

    test('fails for undefined when not optional', () => {
      const r = contract.parse(undefined)
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(0)
    })

    test('fails for null when not nullable', () => {
      const r = contract.parse(null)
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(0)
    })

    test('optional=true allows undefined', () => {
      const opt = $Array.create(item, { optional: true, nullable: false })
      const r = opt.parse(undefined)
      expect(r.success).toBe(true)
      if (r.success) expect(r.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const nul = $Array.create(item, { optional: false, nullable: true })
      const r = nul.parse(null)
      expect(r.success).toBe(true)
      if (r.success) expect(r.value).toBe(null)
    })

    test('optional=true does NOT allow null', () => {
      const opt = $Array.create(item, { optional: true, nullable: false })
      const r = opt.parse(null)
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(0)
    })

    test('nullable=true does NOT allow undefined', () => {
      const nul = $Array.create(item, { optional: false, nullable: true })
      const r = nul.parse(undefined)
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(0)
    })

    test('optional=true + nullable=true allows both undefined and null', () => {
      const both = $Array.create(item, { optional: true, nullable: true })

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)
    })

    test('rejects non-array types', () => {
      const a = contract.parse('123')
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.parse({})
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = contract.parse(Symbol('x'))
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)

      const d = contract.parse(() => [])
      expect(d.success).toBe(false)
      if (!d.success) expect(d.issues.length).toBeGreaterThan(0)

      const e = contract.parse(new Date())
      expect(e.success).toBe(false)
      if (!e.success) expect(e.issues.length).toBeGreaterThan(0)
    })

    test('prefixes issues with the correct index', () => {
      const r = contract.parse([1, 'x', 3])
      expect(r.success).toBe(false)
      if (!r.success) {
        const messages = r.issues.map((i) => String((i as any)?.message ?? i))
        expect(messages.some((m) => m.includes('[1]:'))).toBe(true)
      }
    })

    test('aggregates multiple item failures', () => {
      const r = contract.parse(['x', 'y'])
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(1)
    })
  })

  describe('coerce', () => {
    const item = $Number.create({ optional: false, nullable: false })
    const contract = $Array.create(item, { optional: false, nullable: false })

    test('coerces items using nested coerce', () => {
      const r = contract.coerce(['123', '  123.50  ', '-10'])
      expect(r.success).toBe(true)
      if (r.success) expect(r.value).toEqual([123, 123.5, -10])
    })

    test('passes through numbers unchanged (including Infinity/-Infinity)', () => {
      const r = contract.coerce([1, Infinity, -Infinity])
      expect(r.success).toBe(true)
      if (r.success) expect(r.value).toEqual([1, Infinity, -Infinity])
    })

    test('fails when an item cannot be coerced', () => {
      const r = contract.coerce(['abc'])
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(0)
    })

    test('fails for non-array types', () => {
      const r = contract.coerce('123')
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(0)
    })

    test('undefined/null still follow optional/nullable rules', () => {
      const baseU = contract.coerce(undefined)
      expect(baseU.success).toBe(false)
      if (!baseU.success) expect(baseU.issues.length).toBeGreaterThan(0)

      const baseN = contract.coerce(null)
      expect(baseN.success).toBe(false)
      if (!baseN.success) expect(baseN.issues.length).toBeGreaterThan(0)

      const both = $Array.create(item, { optional: true, nullable: true })

      const u = both.coerce(undefined)
      expect(u.success).toBe(true)
      if (u.success) expect(u.value).toBe(undefined)

      const n = both.coerce(null)
      expect(n.success).toBe(true)
      if (n.success) expect(n.value).toBe(null)
    })

    test('prefixes issues with the correct index', () => {
      const r = contract.coerce([1, 'abc', 3])
      expect(r.success).toBe(false)
      if (!r.success) {
        const messages = r.issues.map((i) => String((i as any)?.message ?? i))
        expect(messages.some((m) => m.includes('[1]:'))).toBe(true)
      }
    })

    test('aggregates multiple item failures', () => {
      const r = contract.coerce(['abc', 'def'])
      expect(r.success).toBe(false)
      if (!r.success) expect(r.issues.length).toBeGreaterThan(1)
    })
  })

  describe('chaining', () => {
    const item = $Number.create({ optional: false, nullable: false })

    test('optional() returns a new contract that allows undefined', () => {
      const base = $Array.create(item, { optional: false, nullable: false })
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $Array.create(item, { optional: false, nullable: false })
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $Array.create(item, { optional: true, nullable: true })
      const req = base.required()

      expect(req.parse(undefined).success).toBe(false)
      expect(req.parse(null).success).toBe(false)

      const c = req.parse([1])
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toEqual([1])
    })

    test('clone() with no args preserves behavior', () => {
      const base = $Array.create(item, { optional: false, nullable: false })
      const cloned = base.clone()

      const a = cloned.parse([1])
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toEqual([1])

      const b = cloned.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('clone() can enable optional without affecting base', () => {
      const base = $Array.create(item, { optional: false, nullable: false })
      const cloned = base.clone({ optional: true })

      const a = cloned.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('optional() + nullable() chaining allows both undefined and null', () => {
      const base = $Array.create(item, { optional: false, nullable: false })
      const both = base.optional().nullable()

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)

      const c = both.parse([1, 2])
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toEqual([1, 2])
    })
  })
})
