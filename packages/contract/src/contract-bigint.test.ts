import { $Bigint } from './contract-bigint'

describe('$Bigint', () => {
  describe('parse', () => {
    const contract = $Bigint.create({ optional: false, nullable: false })

    test('accepts a bigint', () => {
      const a = contract.parse(0n)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(0n)

      const b = contract.parse(123n)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(123n)

      const c = contract.parse(-10n)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(-10n)
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
      const opt = $Bigint.create({ optional: true, nullable: false })
      const result = opt.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const nul = $Bigint.create({ optional: false, nullable: true })
      const result = nul.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })

    test('optional=true does NOT allow null', () => {
      const opt = $Bigint.create({ optional: true, nullable: false })
      const result = opt.parse(null)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('nullable=true does NOT allow undefined', () => {
      const nul = $Bigint.create({ optional: false, nullable: true })
      const result = nul.parse(undefined)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true + nullable=true allows both undefined and null', () => {
      const both = $Bigint.create({ optional: true, nullable: true })

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)
    })

    test('rejects non-bigint types', () => {
      const a = contract.parse(1)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.parse('1')
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = contract.parse(true)
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)

      const d = contract.parse({})
      expect(d.success).toBe(false)
      if (!d.success) expect(d.issues.length).toBeGreaterThan(0)

      const e = contract.parse([])
      expect(e.success).toBe(false)
      if (!e.success) expect(e.issues.length).toBeGreaterThan(0)
    })
  })

  describe('coerce', () => {
    const contract = $Bigint.create({ optional: false, nullable: false })

    test('passes through bigint unchanged', () => {
      const a = contract.coerce(99n)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(99n)
    })

    test('coerces booleans to 1n/0n', () => {
      const a = contract.coerce(true)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(1n)

      const b = contract.coerce(false)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(0n)
    })

    test('coerces integer numbers to bigint', () => {
      const a = contract.coerce(0)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(0n)

      const b = contract.coerce(10)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(10n)

      const c = contract.coerce(-10)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(-10n)
    })

    test('rejects non-integer numbers', () => {
      const a = contract.coerce(1.5)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce(NaN)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = contract.coerce(Infinity)
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)
    })

    test('coerces bigint strings via BigInt()', () => {
      const a = contract.coerce('0')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(0n)

      const b = contract.coerce('123')
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(123n)

      const c = contract.coerce('-10')
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(-10n)
    })

    test('rejects invalid bigint strings', () => {
      const a = contract.coerce('abc')
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce('1.5')
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('rejects empty/whitespace-only strings', () => {
      const a = contract.coerce('')
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce('   ')
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

      const both = $Bigint.create({ optional: true, nullable: true })

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
    })
  })

  describe('chaining', () => {
    test('optional() returns a new contract that allows undefined', () => {
      const base = $Bigint.create({ optional: false, nullable: false })
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $Bigint.create({ optional: false, nullable: false })
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $Bigint.create({ optional: true, nullable: true })
      const req = base.required()

      const a = req.parse(undefined)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = req.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = req.parse(1n)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(1n)
    })

    test('clone() with no args preserves behavior', () => {
      const base = $Bigint.create({ optional: false, nullable: false })
      const cloned = base.clone()

      const a = cloned.parse(1n)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(1n)

      const b = cloned.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('clone() can enable optional without affecting base', () => {
      const base = $Bigint.create({ optional: false, nullable: false })
      const cloned = base.clone({ optional: true })

      const a = cloned.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('optional() + nullable() chaining allows both undefined and null', () => {
      const base = $Bigint.create({ optional: false, nullable: false })
      const both = base.optional().nullable()

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)

      const c = both.parse(10n)
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe(10n)
    })
  })
})