import { $String } from './contract-string'

describe('$String', () => {
  describe('parse', () => {
    const contract = $String.create({ optional: false, nullable: false })

    test('accepts a string', () => {
      const result = contract.parse('hello')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('hello')
    })

    test('accepts an empty string', () => {
      const result = contract.parse('')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('')
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
      const opt = $String.create({ optional: true, nullable: false })
      const result = opt.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const nul = $String.create({ optional: false, nullable: true })
      const result = nul.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })

    test('optional=true does NOT allow null', () => {
      const opt = $String.create({ optional: true, nullable: false })
      const result = opt.parse(null)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('nullable=true does NOT allow undefined', () => {
      const nul = $String.create({ optional: false, nullable: true })
      const result = nul.parse(undefined)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true + nullable=true allows both undefined and null', () => {
      const both = $String.create({ optional: true, nullable: true })

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)
    })

    test('rejects non-string types', () => {
      const a = contract.parse(0)
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

      const f = contract.parse(() => 'x')
      expect(f.success).toBe(false)
      if (!f.success) expect(f.issues.length).toBeGreaterThan(0)
    })
  })

  describe('coerce', () => {
    const contract = $String.create({ optional: false, nullable: false })

    test('coerces finite numbers to string', () => {
      const result = contract.coerce(123.5)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('123.5')
    })

    test('coerces bigint to string', () => {
      const result = contract.coerce(123n)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('123')
    })

    test('coerces booleans to string', () => {
      const a = contract.coerce(true)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('true')

      const b = contract.coerce(false)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe('false')
    })

    test('coerces String objects to primitive string', () => {
      const result = contract.coerce(new String('hello'))
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('hello')
    })

    test('passes through strings unchanged', () => {
      const result = contract.coerce('hello')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('hello')
    })

    test('undefined/null still follow optional/nullable rules', () => {
      const baseU = contract.coerce(undefined)
      expect(baseU.success).toBe(false)
      if (!baseU.success) expect(baseU.issues.length).toBeGreaterThan(0)

      const baseN = contract.coerce(null)
      expect(baseN.success).toBe(false)
      if (!baseN.success) expect(baseN.issues.length).toBeGreaterThan(0)

      const both = $String.create({ optional: true, nullable: true })

      const u = both.coerce(undefined)
      expect(u.success).toBe(true)
      if (u.success) expect(u.value).toBe(undefined)

      const n = both.coerce(null)
      expect(n.success).toBe(true)
      if (n.success) expect(n.value).toBe(null)
    })

    test('rejects non-finite numbers (NaN, Infinity, -Infinity)', () => {
      const a = contract.coerce(NaN)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce(Infinity)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = contract.coerce(-Infinity)
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)
    })

    test('rejects objects/arrays/functions/symbols', () => {
      const a = contract.coerce({})
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce([])
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = contract.coerce(() => 'x')
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
      const base = $String.create({ optional: false, nullable: false })
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $String.create({ optional: false, nullable: false })
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $String.create({ optional: true, nullable: true })
      const req = base.required()

      const a = req.parse(undefined)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = req.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = req.parse('a')
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe('a')
    })

    test('clone() with no args preserves behavior', () => {
      const base = $String.create({ optional: false, nullable: false })
      const cloned = base.clone()

      const a = cloned.parse('x')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('x')

      const b = cloned.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('clone() can enable optional without affecting base', () => {
      const base = $String.create({ optional: false, nullable: false })
      const cloned = base.clone({ optional: true })

      const a = cloned.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('optional() + nullable() chaining allows both undefined and null', () => {
      const base = $String.create({ optional: false, nullable: false })
      const both = base.optional().nullable()

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)

      const c = both.parse('ok')
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe('ok')
    })
  })
})