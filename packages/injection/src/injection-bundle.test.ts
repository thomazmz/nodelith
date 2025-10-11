import { InjectionBundle } from '../injection-bundle'
import { InjectionContext } from '../injection-context'
import { InjectionRegistration } from '../injection-registration'

describe('InjectionBundle', () => {
  it('should create an empty bundle with no options', () => {
    const bundle = InjectionBundle.create()

    expect(bundle).toBeDefined()
    expect(Object.keys(bundle)).toEqual([])
  })

  it('should create a bundle with a provided context', () => {
    const context = InjectionContext.create()
    const bundle = InjectionBundle.create({ context })

    expect(bundle).toBeDefined()
  })

  it('should create a bundle with property descriptor entries', () => {
    const entries: InjectionBundle.Entry[] = [
      ['foo', { value: 'bar', enumerable: true, configurable: true }],
      ['baz', { value: 42, enumerable: true, configurable: true }],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.foo).toBe('bar')
    expect(bundle.baz).toBe(42)
  })

  it('should create a bundle with registration entries', () => {
    const registration = InjectionRegistration.create({
      function: (value: string) => `result:${value}`,
    })

    const entries: InjectionBundle.Entry[] = [
      ['value', { value: 'test', enumerable: true, configurable: true }],
      ['computed', registration],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.value).toBe('test')
    expect(bundle.computed).toBe('result:test')
  })

  it('should create a bundle with mixed descriptor and registration entries', () => {
    const registration = InjectionRegistration.create({
      function: (x: number, y: number) => x + y,
    })

    const entries: InjectionBundle.Entry[] = [
      ['x', { value: 10, enumerable: true, configurable: true }],
      ['y', { value: 20, enumerable: true, configurable: true }],
      ['sum', registration],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.x).toBe(10)
    expect(bundle.y).toBe(20)
    expect(bundle.sum).toBe(30)
  })

  it('should create a bundle that inherits from a parent bundle', () => {
    const parent = InjectionBundle.create({
      entries: [
        ['foo', { value: 'parent-foo', enumerable: true, configurable: true }],
        ['bar', { value: 'parent-bar', enumerable: true, configurable: true }],
      ],
    })

    const child = InjectionBundle.create({
      bundle: parent,
      entries: [
        ['baz', { value: 'child-baz', enumerable: true, configurable: true }],
      ],
    })

    expect(child.foo).toBe('parent-foo')
    expect(child.bar).toBe('parent-bar')
    expect(child.baz).toBe('child-baz')
  })

  it('should allow child bundle to override parent bundle properties', () => {
    const parent = InjectionBundle.create({
      entries: [
        ['foo', { value: 'parent-foo', enumerable: true, configurable: true }],
      ],
    })

    const child = InjectionBundle.create({
      bundle: parent,
      entries: [
        ['foo', { value: 'child-foo', enumerable: true, configurable: true }],
      ],
    })

    expect(child.foo).toBe('child-foo')
  })

  it('should use default enumerable declaration for registration entries', () => {
    const registration = InjectionRegistration.create({
      function: () => 'test',
    })

    const entries: InjectionBundle.Entry[] = [['computed', registration]]

    const bundle = InjectionBundle.create({ entries })

    const descriptor = Object.getOwnPropertyDescriptor(bundle, 'computed')

    expect(descriptor?.enumerable).toBe(InjectionBundle.DEFAULT_ENUMERABLE_DECLARATION)
  })

  it('should use default configurable declaration for registration entries', () => {
    const registration = InjectionRegistration.create({
      function: () => 'test',
    })

    const entries: InjectionBundle.Entry[] = [['computed', registration]]

    const bundle = InjectionBundle.create({ entries })

    const descriptor = Object.getOwnPropertyDescriptor(bundle, 'computed')

    expect(descriptor?.configurable).toBe(InjectionBundle.DEFAULT_CONFIGURABLE_DECLARATION)
  })

  it('should lazily resolve registration entries via getter', () => {
    const spy = jest.fn()

    const registration = InjectionRegistration.create({
      function: () => {
        spy()
        return 'computed-value'
      },
    })

    const entries: InjectionBundle.Entry[] = [['computed', registration]]

    const bundle = InjectionBundle.create({ entries })

    expect(spy).not.toHaveBeenCalled()

    const value = bundle.computed

    expect(spy).toHaveBeenCalledTimes(1)
    expect(value).toBe('computed-value')
  })

  it('should pass bundle to registration resolve', () => {
    const registration = InjectionRegistration.create({
      function: (a: number, b: number) => a * b,
    })

    const entries: InjectionBundle.Entry[] = [
      ['a', { value: 5, enumerable: true, configurable: true }],
      ['b', { value: 3, enumerable: true, configurable: true }],
      ['product', registration],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.product).toBe(15)
  })

  it('should pass context to registration resolve', () => {
    const context = InjectionContext.create()

    const registration = InjectionRegistration.create({
      function: () => ({ value: 'scoped' }),
      lifecycle: 'scoped',
    })

    const entries: InjectionBundle.Entry[] = [['scoped', registration]]

    const bundle = InjectionBundle.create({ entries, context })

    const result1 = bundle.scoped
    const result2 = bundle.scoped

    expect(result1).toBe(result2)
    expect(result1).toEqual({ value: 'scoped' })
  })

  it('should handle multiple registration entries with dependencies', () => {
    const registration1 = InjectionRegistration.create({
      function: (base: string) => `${base}-processed`,
    })

    const registration2 = InjectionRegistration.create({
      function: (processed: string) => `${processed}-final`,
    })

    const entries: InjectionBundle.Entry[] = [
      ['base', { value: 'start', enumerable: true, configurable: true }],
      ['processed', registration1],
      ['final', registration2],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.base).toBe('start')
    expect(bundle.processed).toBe('start-processed')
    expect(bundle.final).toBe('start-processed-final')
  })

  it('should create nested bundles with parent hierarchy', () => {
    const grandparent = InjectionBundle.create({
      entries: [
        ['level', { value: 'grandparent', enumerable: true, configurable: true }],
      ],
    })

    const parent = InjectionBundle.create({
      bundle: grandparent,
      entries: [
        ['parent', { value: 'parent-value', enumerable: true, configurable: true }],
      ],
    })

    const child = InjectionBundle.create({
      bundle: parent,
      entries: [
        ['child', { value: 'child-value', enumerable: true, configurable: true }],
      ],
    })

    expect(child.level).toBe('grandparent')
    expect(child.parent).toBe('parent-value')
    expect(child.child).toBe('child-value')
  })

  it('should handle empty entries array', () => {
    const bundle = InjectionBundle.create({ entries: [] })

    expect(bundle).toBeDefined()
    expect(Object.keys(bundle)).toEqual([])
  })

  it('should support property descriptors with getters', () => {
    const spy = jest.fn()

    const entries: InjectionBundle.Entry[] = [
      [
        'computed',
        {
          get: () => {
            spy()
            return 'getter-value'
          },
          enumerable: true,
          configurable: true,
        },
      ],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(spy).not.toHaveBeenCalled()

    const value = bundle.computed

    expect(spy).toHaveBeenCalledTimes(1)
    expect(value).toBe('getter-value')
  })

  it('should handle singleton lifecycle in bundle context', () => {
    const spy = jest.fn()

    const registration = InjectionRegistration.create({
      function: () => {
        spy()
        return { id: Math.random() }
      },
      lifecycle: 'singleton',
    })

    const entries: InjectionBundle.Entry[] = [['singleton', registration]]

    const bundle = InjectionBundle.create({ entries })

    const result1 = bundle.singleton
    const result2 = bundle.singleton

    expect(spy).toHaveBeenCalledTimes(1)
    expect(result1).toBe(result2)
  })

  it('should handle transient lifecycle in bundle context', () => {
    const spy = jest.fn()

    const registration = InjectionRegistration.create({
      function: () => {
        spy()
        return { id: Math.random() }
      },
      lifecycle: 'transient',
    })

    const entries: InjectionBundle.Entry[] = [['transient', registration]]

    const bundle = InjectionBundle.create({ entries })

    const result1 = bundle.transient
    const result2 = bundle.transient

    expect(spy).toHaveBeenCalledTimes(2)
    expect(result1).not.toBe(result2)
  })

  it('should resolve class registrations in bundle', () => {
    class TestService {
      constructor(public readonly config: string) {}

      public getConfig() {
        return this.config
      }
    }

    const registration = InjectionRegistration.create({
      class: TestService,
      resolution: 'eager',
    })

    const entries: InjectionBundle.Entry[] = [
      ['config', { value: 'test-config', enumerable: true, configurable: true }],
      ['service', registration],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.service).toBeInstanceOf(TestService)
    expect(bundle.service.getConfig()).toBe('test-config')
  })

  it('should resolve factory registrations in bundle', () => {
    const factory = (prefix: string, suffix: string) => ({
      format: (value: string) => `${prefix}${value}${suffix}`,
    })

    const registration = InjectionRegistration.create({
      factory,
      resolution: 'eager',
    })

    const entries: InjectionBundle.Entry[] = [
      ['prefix', { value: '[', enumerable: true, configurable: true }],
      ['suffix', { value: ']', enumerable: true, configurable: true }],
      ['formatter', registration],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.formatter.format('test')).toBe('[test]')
  })

  it('should support bundle provision for registrations', () => {
    const registration = InjectionRegistration.create({
      function: (bundle: InjectionBundle) => {
        return `${bundle['a']}-${bundle['b']}-${bundle['c']}`
      },
      provision: 'bundle',
    })

    const entries: InjectionBundle.Entry[] = [
      ['a', { value: 'first', enumerable: true, configurable: true }],
      ['b', { value: 'second', enumerable: true, configurable: true }],
      ['c', { value: 'third', enumerable: true, configurable: true }],
      ['combined', registration],
    ]

    const bundle = InjectionBundle.create({ entries })

    expect(bundle.combined).toBe('first-second-third')
  })
})

