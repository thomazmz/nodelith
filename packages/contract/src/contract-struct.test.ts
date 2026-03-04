import { $Struct } from './contract-struct'
import { $String } from './contract-string'
import { $Number } from './contract-number'

describe('$Struct', () => {
  describe('parse', () => {
    const contract = $Struct.create(
      {
        name: $String.create({ optional: false, nullable: false }),
        age: $Number.create({ optional: false, nullable: false }),
      },
      { optional: false, nullable: false }
    )

    test('accepts a plain object and strips unknown keys', () => {
      const result = contract.parse({ name: 'Ada', age: 33, extra: 'nope' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toEqual({ name: 'Ada', age: 33 })
        expect((result.value).extra).toBeUndefined()
      }
    })

    test('accepts null-prototype objects', () => {
      const input = Object.create(null)
      input.name = 'Ada'
      input.age = 33
      input.extra = 'nope'

      const result = contract.parse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toEqual({ name: 'Ada', age: 33 })
        expect((result.value).extra).toBeUndefined()
      }
    })

    test('missing keys are treated as undefined (nested contract decides)', () => {
      const result = contract.parse({ name: 'Ada' })
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
      const opt = $Struct.create(
        { name: $String.create({ optional: false, nullable: false }) },
        { optional: true, nullable: false }
      )
      const result = opt.parse(undefined)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(undefined)
    })

    test('nullable=true allows null', () => {
      const nul = $Struct.create(
        { name: $String.create({ optional: false, nullable: false }) },
        { optional: false, nullable: true }
      )
      const result = nul.parse(null)
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toBe(null)
    })

    test('rejects non-plain objects (arrays, dates, class instances)', () => {
      const a = contract.parse([])
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = contract.parse(new Date())
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      class Foo { x = 1 }
      const c = contract.parse(new Foo())
      expect(c.success).toBe(false)
      if (!c.success) expect(c.issues.length).toBeGreaterThan(0)
    })

    test('adds field path context to issues', () => {
      const result = contract.parse({ name: 'Ada', age: '33' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const msgs = result.issues.map(i => (i)?.message ?? String(i))
        expect(msgs.some(m => m.includes('age:'))).toBe(true)
      }
    })

    test('parse stays strict (does not coerce nested fields)', () => {
      const result = contract.parse({ name: 123, age: '33' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const msgs = result.issues.map(i => (i)?.message ?? String(i))
        expect(msgs.some(m => m.includes('name:'))).toBe(true)
        expect(msgs.some(m => m.includes('age:'))).toBe(true)
      }
    })
  })

  describe('coerce', () => {
    const contract = $Struct.create(
      {
        name: $String.create({ optional: false, nullable: false }),
        age: $Number.create({ optional: false, nullable: false }),
      },
      { optional: false, nullable: false }
    )

    test('uses nested coercion for fields', () => {
      const result = contract.coerce({ name: 'Ada', age: '33' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.value).toEqual({ name: 'Ada', age: 33 })
    })

    test('still strips unknown keys', () => {
      const result = contract.coerce({ name: 'Ada', age: '33', extra: 1 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toEqual({ name: 'Ada', age: 33 })
        expect((result.value).extra).toBeUndefined()
      }
    })

    test('accepts null-prototype objects', () => {
      const input = Object.create(null)
      input.name = 'Ada'
      input.age = '33'
      input.extra = 1

      const result = contract.coerce(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.value).toEqual({ name: 'Ada', age: 33 })
        expect((result.value).extra).toBeUndefined()
      }
    })

    test('rejects non-plain objects', () => {
      const result = contract.coerce([])
      expect(result.success).toBe(false)
      if (!result.success) expect(result.issues.length).toBeGreaterThan(0)
    })

    test('adds field path context to issues in coerce mode too', () => {
      const result = contract.coerce({ name: 'Ada', age: 'nope' })
      expect(result.success).toBe(false)
      if (!result.success) {
        const msgs = result.issues.map(i => (i)?.message ?? String(i))
        expect(msgs.some(m => m.includes('age:'))).toBe(true)
      }
    })
  })

  describe('chaining', () => {
    test('optional() returns a new contract that allows undefined', () => {
      const base = $Struct.create(
        { a: $String.create({ optional: false, nullable: false }) },
        { optional: false, nullable: false }
      )
      const opt = base.optional()

      const a = opt.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('nullable() returns a new contract that allows null', () => {
      const base = $Struct.create(
        { a: $String.create({ optional: false, nullable: false }) },
        { optional: false, nullable: false }
      )
      const nul = base.nullable()

      const a = nul.parse(null)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(null)

      const b = base.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('required() disables optional + nullable', () => {
      const base = $Struct.create(
        { a: $String.create({ optional: false, nullable: false }) },
        { optional: true, nullable: true }
      )
      const req = base.required()

      const a = req.parse(undefined)
      expect(a.success).toBe(false)
      if (!a.success) expect(a.issues.length).toBeGreaterThan(0)

      const b = req.parse(null)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)

      const c = req.parse({ a: 'ok' })
      expect(c.success).toBe(true)
      if (c.success) expect(c.value).toEqual({ a: 'ok' })
    })

    test('clone() with no args preserves behavior', () => {
      const base = $Struct.create(
        { a: $String.create({ optional: false, nullable: false }) },
        { optional: false, nullable: false }
      )
      const cloned = base.clone()

      const a = cloned.parse({ a: 'x' })
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toEqual({ a: 'x' })

      const b = cloned.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })

    test('clone() can enable optional without affecting base', () => {
      const base = $Struct.create(
        { a: $String.create({ optional: false, nullable: false }) },
        { optional: false, nullable: false }
      )
      const cloned = base.clone({ optional: true })

      const a = cloned.parse(undefined)
      expect(a.success).toBe(true)
      if (a.success) expect(a.value).toBe(undefined)

      const b = base.parse(undefined)
      expect(b.success).toBe(false)
      if (!b.success) expect(b.issues.length).toBeGreaterThan(0)
    })
  })
})