import { Bundle, createBundle, mergeBundles } from './bundle'

describe('Bundle', () => {
  describe('createBundle', () => {
    it('defines properties with value descriptors', () => {
      const bundle = createBundle(
        ['foo', { enumerable: true, value: 1 }],
        ['bar', { enumerable: true, value: 2 }],
      )
  
      expect(bundle.foo).toBe(1)
      expect(bundle.bar).toBe(2)
    })
  
    it('defines properties with getter descriptors', () => {
      const bundle = createBundle(
        ['foo', { enumerable: true, get: () => 42 }],
      )
  
      expect(bundle.foo).toBe(42)
    })
  
    it('defines properties using resolve functions', () => {
      const bundle = createBundle(
        ['foo', { enumerable: true, resolve: () => 100 }],
      )
  
      expect(bundle.foo).toBe(100)
    })
  
    it('passes the bundle to the resolve function', () => {
      const bundle = createBundle(
        ['foo', { enumerable: true, value: 2 }],
        ['bar', { enumerable: true, resolve: (bundle) => bundle.foo + 3 }],
      )
  
      expect(bundle.bar).toBe(5)
    })
  
    it('respects key precedence', () => {
      const bundle = createBundle(
        ['x', { enumerable: true, value: 1 }],
        ['x', { enumerable: true, value: 999 }],
      )
  
      expect(bundle.x).toBe(1)
    })
  
    it('throws if value and resolve are both defined', () => {
      expect(() => {
        createBundle(
          ['foo', { enumerable: true, value: 1, resolve: () => 2 }],
        )
      }).toThrow(/Cannot specify both 'value' and 'resolve'/)
    })
  
    it('throws if get and resolve are both defined', () => {
      expect(() => {
        createBundle(
          ['foo', { enumerable: true, resolve: () => 2, get: () => 1 }],
        )
      }).toThrow(/Cannot specify both 'get' and 'resolve'/)
    })
  
    it('does not invoke resolve until accessed', () => {
      const resolve = jest.fn(() => 123)
  
      const bundle = createBundle(
        ['foo', { enumerable: true, resolve }],
      )
  
      expect(resolve).not.toHaveBeenCalled()
      expect(bundle.foo).toBe(123)
      expect(resolve).toHaveBeenCalledTimes(1)
    })
  
    it('returns a frozen object', () => {
      const bundle = createBundle(
        ['foo', { enumerable: true, value: 1 }],
      )
  
      expect(Object.isFrozen(bundle)).toBe(true)
    })
  
    it('returns an empty frozen bundle if no entries are given', () => {
      const bundle = createBundle()
      expect(Object.keys(bundle)).toHaveLength(0)
      expect(Object.isFrozen(bundle)).toBe(true)
    })

    it('accepts BundleDescriptorMap as input', () => {
      const bundle = createBundle({
        foo: { enumerable: true, value: 1 },
        bar: { enumerable: true, value: 2 },
      })
    
      expect(bundle.foo).toBe(1)
      expect(bundle.bar).toBe(2)
    })

    it('supports mixed BundleDescriptorEntry and BundleDescriptorMap', () => {
      const bundle = createBundle(
        ['baz', { enumerable: true, value: 3 }],
        {
          foo: { enumerable: true, value: 1 },
          bar: { enumerable: true, value: 2 },
        }
      )
    
      expect(bundle.foo).toBe(1)
      expect(bundle.bar).toBe(2)
      expect(bundle.baz).toBe(3)
    })

    it('ignores undefined descriptors', () => {
      const bundle = createBundle(
        undefined,
        ['foo', { enumerable: true, value: 42 }],
        null as any // simulate bad input
      )
    
      expect(bundle.foo).toBe(42)
    })
    
    it('preserves enumerability during merge', () => {
      const bundle1 = createBundle({
        a: { value: 1, enumerable: false },
        b: { value: 2, enumerable: true },
      })
    
      const merged = mergeBundles(bundle1)
    
      expect(Object.keys(merged)).toContain('b')
      expect(Object.keys(merged)).not.toContain('a')
    })

    it('prevents mutation of bundle properties after creation', () => {
      const bundle = createBundle(['foo', { enumerable: true, value: 10 }])
    
      expect(() => {
        (bundle as any).foo = 999
      }).toThrow()
    })
  })

  describe('mergeBundles', () => {
    it('merges multiple bundles with first key precedence', () => {
      const bundle_0 = createBundle(
        ['foo', { enumerable: true, value: 1 }],
      )

      const bundle_1 = createBundle(
        ['bar', { enumerable: true, value: 2 }],
        ['foo', { enumerable: true, value: 999 }],
      )

      const bundle_2 = createBundle(
        ['baz', { enumerable: true, value: 3 }],
        ['bar', { enumerable: true, value: 888 }],
      )
  
      const merged = mergeBundles(
        bundle_0,
        bundle_1,
        bundle_2,
      )
  
      expect(merged.foo).toBe(1)
      expect(merged.bar).toBe(2)
      expect(merged.baz).toBe(3)
    })
  
    it('skips undefined and null bundles', () => {
      const bundle_0 = createBundle(
        ['foo', { enumerable: true, value: 1 }],
      )

      const bundle_1 = createBundle(
        ['bar', { enumerable: true, value: 2 }],
      )
  
      const merged = mergeBundles(
        null, undefined, bundle_0, 
        null, undefined, bundle_1,
        null, undefined,
      )
  
      expect(merged.foo).toBe(1)
      expect(merged.bar).toBe(2)
    })
  
    it('returns empty bundle when given no bundles', () => {
      const merged = mergeBundles()
      expect(Object.keys(merged)).toHaveLength(0)
      expect(Object.isFrozen(merged)).toBe(true)
    })
  
    it('preserves non-enumerable properties', () => {
      const bundle = createBundle(
        ['secret', { enumerable: false, value: 42 }],
      )

      const merged = mergeBundles(bundle)
  
      expect(merged.secret).toBe(42)

      expect(Object.keys(merged)).not.toContain('secret')
    })
  
    it('does not invoke getter during merge', () => {
      const get = jest.fn(() => 456)
  
      const object = {}

      Object.defineProperty(object, 'expensive', { enumerable: true, get })
  
      const merged = mergeBundles(object)
  
      expect(get).not.toHaveBeenCalled()
      expect(merged.expensive).toBe(456)
      expect(get).toHaveBeenCalledTimes(1)
    })
  })
  
  describe('namespace', () => {
    it('exposes create function', () => {
      expect(Bundle.create).toBe(createBundle)
    })
    it('exposes merge function', () => {
      expect(Bundle.merge).toBe(mergeBundles)
    })
  })
})
