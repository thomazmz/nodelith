import { $Enum } from './contract-enum'

describe('$Enum', () => {
  describe('parse', () => {
    const contract = $Enum.create(['a', 'b'] as const, { optional: false, nullable: false })

    test('accepts allowed strings', () => {
      const a = contract.parse('a')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('a')

      const b = contract.parse('b')
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe('b')
    })

    test('fails for unexpected string value', () => {
      const result = contract.parse('c')
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
      const opt = $Enum.create(['a', 'b'] as const, { optional: true, nullable: false })
      const result = opt.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const nul = $Enum.create(['a', 'b'] as const, { optional: false, nullable: true })
      const result = nul.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })

    test('optional=true does NOT allow null', () => {
      const opt = $Enum.create(['a', 'b'] as const, { optional: true, nullable: false })
      const result = opt.parse(null)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('nullable=true does NOT allow undefined', () => {
      const nul = $Enum.create(['a', 'b'] as const, { optional: false, nullable: true })
      const result = nul.parse(undefined)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true + nullable=true allows both undefined and null', () => {
      const both = $Enum.create(['a', 'b'] as const, { optional: true, nullable: true })

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)
    })

    test('rejects non-string types', () => {
      const a = contract.parse(1)
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

      const g = contract.parse(new Date())
      expect(g.success).toBe(false)
      if (!g.success) expect(g.issues.length).toBeGreaterThan(0)
    })
  })

  describe('coerce', () => {
    const contract = $Enum.create(['a', 'b'] as const, { optional: false, nullable: false })

    test('passes through allowed strings unchanged', () => {
      const a = contract.coerce('a')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('a')

      const b = contract.coerce('b')
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe('b')
    })

    test('rejects unexpected string value', () => {
      const result = contract.coerce('c')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects non-string types', () => {
      const a = contract.coerce(1)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.coerce(true)
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

      const both = $Enum.create(['a'] as const, { optional: true, nullable: true })

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
      const base = $Enum.create(['a'] as const, { optional: false, nullable: false })
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $Enum.create(['a'] as const, { optional: false, nullable: false })
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $Enum.create(['a'] as const, { optional: true, nullable: true })
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
      const base = $Enum.create(['a'] as const, { optional: false, nullable: false })
      const cloned = base.clone()

      const a = cloned.parse('a')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('a')

      const b = cloned.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('clone() can enable optional without affecting base', () => {
      const base = $Enum.create(['a'] as const, { optional: false, nullable: false })
      const cloned = base.clone({ optional: true })

      const a = cloned.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('optional() + nullable() chaining allows both undefined and null', () => {
      const base = $Enum.create(['a'] as const, { optional: false, nullable: false })
      const both = base.optional().nullable()

      const a = both.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = both.parse(null)
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe(null)

      const c = both.parse('a')
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toBe('a')
    })
  })
})
