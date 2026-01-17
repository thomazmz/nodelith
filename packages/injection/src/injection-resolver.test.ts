import {
  createClassResolver,
  createFactoryResolver,
  createFunctionResolver,
  createValueResolver,
} from './injection-resolver'

describe('InjectionResolver', () => {
  it('creates a value resolver that always returns the provided value', () => {
    const resolver = createValueResolver(42)
    expect(resolver()).toBe(42)
    expect(resolver()).toBe(42)
  })

  it('creates a function resolver', () => {
    let calls = 0
    const fn = (x: number) => {
      calls += 1
      return x + 1
    }
    const resolver = createFunctionResolver(fn)
    expect(resolver(3)).toBe(4)
    expect(calls).toBe(1)
  })

  it('creates a lazy factory resolver proxy', () => {
    let calls = 0
    const factory = (name: string) => {
      calls += 1
      return { name }
    }

    const resolver = createFactoryResolver(factory)
    const proxy = resolver('alice')

    expect(calls).toBe(0)
    expect(proxy.name).toBe('alice')
    expect(calls).toBe(1)
  })

  it('creates a lazy class resolver proxy', () => {
    let constructed = 0

    class Person {
      public constructor(public name: string) {
        constructed += 1
      }
      public greet() {
        return `hi ${this.name}`
      }
    }

    const resolver = createClassResolver(Person)
    const proxy = resolver('bob')

    expect(constructed).toBe(0)
    expect(proxy.name).toBe('bob')
    expect(constructed).toBe(1)
    expect(proxy.greet()).toBe('hi bob')
  })
})
