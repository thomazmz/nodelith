import { InjectionContext } from './injection-context'
import { Core } from '@nodelith/core'

describe('InjectionContext', () => {
  it('should create a new context instance', () => {
    const context = InjectionContext.create()

    expect(context).toBeDefined()
    expect(context).toBeInstanceOf(InjectionContext)
  })

  it('should create a context with a unique identity', () => {
    const context = InjectionContext.create()
    expect(context.identity).toBeDefined()
    expect(typeof context.identity).toBe('string')
    expect(context.identity).toMatch(/^[0-9A-Za-z]{22}$/)
  })

  it('should create contexts with different identities', () => {
    const context1 = InjectionContext.create()
    const context2 = InjectionContext.create()
    expect(context1.identity).not.toBe(context2.identity)
  })

  it('should return the same identity for the same context', () => {
    const context = InjectionContext.create()
    const identity1 = context.identity
    const identity2 = context.identity
    expect(identity1).toBe(identity2)
  })

  it('should resolve a function with no arguments', () => {
    const context = InjectionContext.create()
    const target = () => 'result'

    const result = context.resolve(target)

    expect(result).toBe('result')
  })

  it('should resolve a function with arguments', () => {
    const context = InjectionContext.create()
    const target = (a: number, b: number) => a + b

    const result = context.resolve(target, 5, 3)

    expect(result).toBe(8)
  })

  it('should cache the result of a function call', () => {
    const context = InjectionContext.create()
    const spy = jest.fn()

    const target = () => {
      spy()
      return { value: 'cached' }
    }

    const result1 = context.resolve(target)
    const result2 = context.resolve(target)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(result1).toBe(result2)
  })

  it('should use cached result even with different arguments on subsequent calls', () => {
    const context = InjectionContext.create()
    const spy = jest.fn()

    const target = (value: number) => {
      spy()
      return { computed: value * 2 }
    }

    const result1 = context.resolve(target, 5)
    const result2 = context.resolve(target, 10)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(result1).toBe(result2)
    expect(result1.computed).toBe(10)
  })

  it('should cache results per target function', () => {
    const context = InjectionContext.create()

    const target1 = () => ({ id: 1 })
    const target2 = () => ({ id: 2 })

    const result1 = context.resolve(target1)
    const result2 = context.resolve(target2)

    expect(result1).not.toBe(result2)
    expect(result1.id).toBe(1)
    expect(result2.id).toBe(2)
  })

  it('should cache results separately for different contexts', () => {
    const context1 = InjectionContext.create()
    const context2 = InjectionContext.create()
    const spy = jest.fn()

    const target = () => {
      spy()
      return { value: Math.random() }
    }

    const result1 = context1.resolve(target)
    const result2 = context2.resolve(target)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(result1).not.toBe(result2)
  })

  it('should handle functions that return primitives', () => {
    const context = InjectionContext.create()

    const stringTarget = () => 'string-result'
    const numberTarget = () => 42
    const booleanTarget = () => true

    expect(context.resolve(stringTarget)).toBe('string-result')
    expect(context.resolve(numberTarget)).toBe(42)
    expect(context.resolve(booleanTarget)).toBe(true)
  })

  it('should handle functions that return objects', () => {
    const context = InjectionContext.create()

    const target = () => ({ foo: 'bar', baz: 42 })

    const result = context.resolve(target)

    expect(result).toEqual({ foo: 'bar', baz: 42 })
  })

  it('should handle functions that return arrays', () => {
    const context = InjectionContext.create()

    const target = () => [1, 2, 3, 4, 5]

    const result = context.resolve(target)

    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle functions that return null', () => {
    const context = InjectionContext.create()

    const target = () => null

    const result = context.resolve(target)

    expect(result).toBeNull()
  })

  it('should handle functions that return undefined', () => {
    const context = InjectionContext.create()

    const target = () => undefined

    const result = context.resolve(target)

    expect(result).toBeUndefined()
  })

  it('should handle class constructors as target functions', () => {
    const context = InjectionContext.create()

    class TestClass {
      constructor(public value: string) {}
    }

    const target = (value: string) => new TestClass(value)

    const result = context.resolve(target, 'test')

    expect(result).toBeInstanceOf(TestClass)
    expect(result.value).toBe('test')
  })

  it('should preserve the cached instance across multiple resolve calls', () => {
    const context = InjectionContext.create()

    const target = () => ({ id: Math.random() })

    const result1 = context.resolve(target)
    const result2 = context.resolve(target)
    const result3 = context.resolve(target)

    expect(result1).toBe(result2)
    expect(result2).toBe(result3)
  })

  it('should use function identity for caching', () => {
    const context = InjectionContext.create()

    const target = () => 'result'

    const result1 = context.resolve(target)
    const result2 = context.resolve(target)

    expect(result1).toBe(result2)
  })

  it('should create identity for functions that do not have one', () => {
    const context = InjectionContext.create()

    const target = () => 'result'

    expect(Core.Identity.extract(target)).toBeUndefined()

    context.resolve(target)

    expect(Core.Identity.extract(target)).toBeDefined()
  })

  it('should handle arrow functions', () => {
    const context = InjectionContext.create()

    const target = () => ({ type: 'arrow' })

    const result = context.resolve(target)

    expect(result).toEqual({ type: 'arrow' })
  })

  it('should handle regular functions', () => {
    const context = InjectionContext.create()

    function target() {
      return { type: 'regular' }
    }

    const result = context.resolve(target)

    expect(result).toEqual({ type: 'regular' })
  })

  it('should handle async functions returning resolved values', async () => {
    const context = InjectionContext.create()

    const target = async () => 'async-result'

    const result = context.resolve(target)

    expect(result).toBeInstanceOf(Promise)
    expect(await result).toBe('async-result')
  })
})

