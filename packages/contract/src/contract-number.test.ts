import { $Number } from './contract-number'

describe('$Number', () => {
  describe('parse', () => {
    const contract = $Number.create({ optional: false, nullable: false })

    test('accepts finite numbers', () => {
      const a = contract.parse(123.5)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(123.5)

      const b = contract.parse(0)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(0)

      const c = contract.parse(-10)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(-10)
    })

    test('accepts Infinity and -Infinity', () => {
      const a = contract.parse(Infinity)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(Infinity)

      const b = contract.parse(-Infinity)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(-Infinity)
    })

    test('fails for NaN', () => {
      const result = contract.parse(NaN)
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
      const opt = $Number.create({ optional: true, nullable: false })
      const result = opt.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const nul = $Number.create({ optional: false, nullable: true })
      const result = nul.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })

    test('optional=true does NOT allow null', () => {
      const opt = $Number.create({ optional: true, nullable: false })
      const result = opt.parse(null)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('nullable=true does NOT allow undefined', () => {
      const nul = $Number.create({ optional: false, nullable: true })
      const result = nul.parse(undefined)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true + nullable=true allows both undefined and null', () => {
      const both = $Number.create({ optional: true, nullable: true })

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)
    })

    test('rejects non-number types', () => {
      const a = contract.parse('123')
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.parse(true)
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

      const f = contract.parse(() => 1)
      expect(f.success).toBe(false)
      if (!f.success) expect(f.issues.length).toBeGreaterThan(0)
    })
  })

  describe('coerce', () => {
    const contract = $Number.create({ optional: false, nullable: false })

    test('passes through numbers unchanged (including Infinity/-Infinity)', () => {
      const a = contract.coerce(42)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(42)

      const b = contract.coerce(Infinity)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(Infinity)

      const c = contract.coerce(-Infinity)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(-Infinity)
    })

    test('rejects NaN', () => {
      const result = contract.coerce(NaN)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('coerces booleans to 1/0', () => {
      const a = contract.coerce(true)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(1)

      const b = contract.coerce(false)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(0)
    })

    test('coerces numeric strings to numbers (including Infinity/-Infinity)', () => {
      const a = contract.coerce('123')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(123)

      const b = contract.coerce('  123.50  ')
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(123.5)

      const c = contract.coerce('-10')
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(-10)

      const d = contract.coerce('Infinity')
      expect(d.success).toBe(true)
      if (d.success) expect(d.value).toBe(Infinity)

      const e = contract.coerce('-Infinity')
      expect(e.success).toBe(true)
      if (e.success) expect(e.value).toBe(-Infinity)
    })

    test('rejects empty/whitespace-only strings behavior)', () => {
      const a = contract.coerce('')
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce('   ')
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('rejects non-numeric strings', () => {
      const result = contract.coerce('abc')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('coerces bigint within safe range', () => {
      const a = contract.coerce(0n)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(0)

      const b = contract.coerce(BigInt(Number.MAX_SAFE_INTEGER))
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(Number.MAX_SAFE_INTEGER)

      const c = contract.coerce(BigInt(Number.MIN_SAFE_INTEGER))
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(Number.MIN_SAFE_INTEGER)
    })

    test('rejects bigint out of safe range', () => {
      const a = contract.coerce(BigInt(Number.MAX_SAFE_INTEGER) + 1n)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce(BigInt(Number.MIN_SAFE_INTEGER) - 1n)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('undefined/null still follow optional/nullable rules', () => {
      const baseU = contract.coerce(undefined)
      expect(baseU.success).toBe(false)
      if (!baseU.success) expect(baseU.issues.length).toBeGreaterThan(0)

      const baseN = contract.coerce(null)
      expect(baseN.success).toBe(false)
      if (!baseN.success) expect(baseN.issues.length).toBeGreaterThan(0)

      const both = $Number.create({ optional: true, nullable: true })

      const u = both.coerce(undefined)
      expect(u.success).toBe(true)
      if (u.success) expect(u.value).toBe(undefined)

      const n = both.coerce(null)
      expect(n.success).toBe(true)
      if (n.success) expect(n.value).toBe(null)
    })

    test('rejects objects/arrays/functions/symbols', () => {
      const a = contract.coerce({})
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce([])
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = contract.coerce(() => 1)
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)

      const d = contract.coerce(Symbol('x'))
      expect(d.success).toBe(false)
      if (!d.success) expect(d.issues.length).toBeGreaterThan(0)

      const e = contract.coerce(new Date())
      expect(e.success).toBe(false)
      if (!e.success) expect(e.issues.length).toBeGreaterThan(0)
    })
  })

  describe('chaining', () => {
    test('optional() returns a new contract that allows undefined', () => {
      const base = $Number.create({ optional: false, nullable: false })
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $Number.create({ optional: false, nullable: false })
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $Number.create({ optional: true, nullable: true })
      const req = base.required()

      const a = req.parse(undefined)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = req.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = req.parse(1)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(1)
    })

    test('clone() with no args preserves behavior', () => {
      const base = $Number.create({ optional: false, nullable: false })
      const cloned = base.clone()

      const a = cloned.parse(1)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(1)

      const b = cloned.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('clone() can enable optional without affecting base', () => {
      const base = $Number.create({ optional: false, nullable: false })
      const cloned = base.clone({ optional: true })

      const a = cloned.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('optional() + nullable() chaining allows both undefined and null', () => {
      const base = $Number.create({ optional: false, nullable: false })
      const both = base.optional().nullable()

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)

      const c = both.parse(10)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(10)
    })
  })
})