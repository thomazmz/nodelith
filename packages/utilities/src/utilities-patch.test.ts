import { merge } from './utilities-patch'

describe('Patch', () => {
  describe('merge', () => {
    it('deep-merges plain objects recursively', () => {
      const current = { a: 1, nested: { x: 1, y: 2 }}
      const patch = { b: 2, nested: { y: 99, z: 3 } }

      const result = merge(current, patch)

      expect(result).toEqual({
        a: 1,
        b: 2,
        nested: { x: 1, y: 99, z: 3 },
      })

      expect(result).not.toBe(current)
      expect((result).nested).not.toBe(current.nested)
      expect(current).toEqual({ a: 1, nested: { x: 1, y: 2 } })
    })

    it('returns current when patch is undefined', () => {
      const current = { a: 1 }
      expect(merge(current, undefined)).toBe(current)
    })

    it('overrides with null when patch is null', () => {
      expect(merge({ a: 1 }, null)).toBeNull()
      expect(merge({ x: { a: 1 } }, { x: null })).toEqual({ x: null })
    })

    it('merges arrays by concatenation', () => {
      const current = [1, 2]
      const patch = [3, 4]

      const result = merge(current, patch)

      expect(result).toEqual([1, 2, 3, 4])
      expect(result).not.toBe(current)
      expect(result).not.toBe(patch)
      expect(current).toEqual([1, 2])
      expect(patch).toEqual([3, 4])
    })

    it('creates a shallow copy when patch is an array and current is not', () => {
      const patch = [{ a: 1 }]
      const result = merge(undefined, patch)

      expect(result).toEqual([{ a: 1 }])
      expect(result).not.toBe(patch)
      expect((result)[0]).toBe(patch[0])
    })

    it('treats Date as an atomic value (no merge)', () => {
      const d1 = new Date(0)
      const d2 = new Date(1)

      expect(merge(d1, d2)).toBe(d2)
      expect(merge({ d: d1 }, { d: d2 })).toEqual({ d: d2 })
    })

    it('treats functions as atomic values (no merge)', () => {
      const f1 = () => 1
      const f2 = () => 2
      expect(merge(f1, f2)).toBe(f2)
      expect(merge({ f: f1 }, { f: f2 })).toEqual({ f: f2 })
    })

    it('does not merge class instances (overrides by reference)', () => {
      class Box {
        constructor(public value: number) {}
      }

      const b1 = new Box(1)
      const b2 = new Box(2)

      expect(merge(b1, b2)).toBe(b2)

      const result = merge({ box: b1 }, { box: b2 })
      expect(result.box).toBe(b2)
    })

    it('preserves array element references when concatenating', () => {
      const a = { id: 'a' }
      const b = { id: 'b' }

      const result = merge([a], [b])

      expect(result).toHaveLength(2)
      expect(result[0]).toBe(a)
      expect(result[1]).toBe(b)
    })
  })
})

