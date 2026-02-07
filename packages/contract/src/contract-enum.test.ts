import { $Enum } from './contract-enum'

describe('$Enum', () => {
  describe('parse', () => {
    const contract = $Enum.create(['draft', 'published'], { optional: false, nullable: false })

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

    test('accepts allowed values', () => {
      const a = contract.parse('draft')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('draft')

      const b = contract.parse('published')
      expect(b.success).toBe(true)
      if (b.success) expect(b.value).toBe('published')
    })

    test('rejects disallowed values', () => {
      const result = contract.parse('archived')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('rejects values of other types (even if same "text")', () => {
      const numEnum = $Enum.create([1, 2], { optional: false, nullable: false })

      const a = numEnum.parse('1')
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = numEnum.parse(true)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = numEnum.parse(3)
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)
    })

    test('optional=true allows undefined', () => {
      const contract = $Enum.create(['draft', 'published'], { optional: true, nullable: false })
      const result = contract.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const contract = $Enum.create(['draft', 'published'], { optional: false, nullable: true })
      const result = contract.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })
  })

  describe('normalize', () => {
    // $Enum doesn't coerce; normalize == parse
    const contract = $Enum.create(['draft', 'published'], { optional: false, nullable: false })

    test('accepts allowed values', () => {
      const result = contract.normalize('draft')
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe('draft')
    })

    test('rejects disallowed values', () => {
      const result = contract.normalize('archived')
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('fails for undefined when not optional', () => {
      const result = contract.normalize(undefined)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('fails for null when not nullable', () => {
      const result = contract.normalize(null)
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('optional=true allows undefined', () => {
      const contract = $Enum.create(['draft', 'published'], { optional: true, nullable: false })
      const result = contract.normalize(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const contract = $Enum.create(['draft', 'published'], { optional: false, nullable: true })
      const result = contract.normalize(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })
  })

  describe('chaining / cloning', () => {
    test('optional() returns a new contract that allows undefined', () => {
      const base = $Enum.create(['a', 'b'], { optional: false, nullable: false })
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $Enum.create(['a', 'b'], { optional: false, nullable: false })
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $Enum.create(['a', 'b'], { optional: true, nullable: true })
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

    test('clone method preserves enum values', () => {
      const base = $Enum.create(['x', 'y'], { optional: false, nullable: false })
      const cloned = base.clone({ optional: true })

      const a = cloned.parse('x')
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe('x')

      const b = cloned.parse('z')
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })
  })
})
