import { Bundle } from './bundle'
import { Context } from './context'

describe('Context', () => {
  describe('resolve', () => {
    it('calls the resolver function and returns its result', () => {
      const context = Context.create()
      const someFunction = (bundle: Bundle) => `${bundle.x}-${bundle.y}`

      const bundle = { x: 'prefix', y: 'suffix' }
      const result = context.resolve(someFunction, bundle)
      expect(result).toBe('prefix-suffix')
    })

    it('returns the same result on repeated calls to the same resolver', () => {
      const context = Context.create()
      const someFunction = jest.fn((bundle: Bundle) => ({ value: bundle.x }))

      const result1 = context.resolve(someFunction, { value: 1 })
      const result2 = context.resolve(someFunction, { value: 2 })

      expect(result1).toBe(result2)
      expect(someFunction).toHaveBeenCalledTimes(1)
    })

    it('calls different resolvers independently', () => {
      const context = Context.create()
      const someFunction_0 = jest.fn(() => '0')
      const someFunction_1 = jest.fn(() => '1')

      const result_0 = context.resolve(someFunction_0)
      const result_1 = context.resolve(someFunction_1)

      expect(result_0).toBe('0')
      expect(result_1).toBe('1')
      expect(someFunction_0).toHaveBeenCalledTimes(1)
      expect(someFunction_1).toHaveBeenCalledTimes(1)
    })

    it('passes dependencies to the function', () => {
      const context = Context.create()
      const someFunction = jest.fn((bundle: Bundle) => `${bundle.x}-${bundle.y}`)

      const bundle = { x: 'prefix', y: 'suffix' }
      const result = context.resolve(someFunction, bundle)
      expect(someFunction).toHaveBeenCalledWith(bundle)
      expect(result).toBe('prefix-suffix')
    })

    it('ensures resolve uses a stable identity for each function', () => {
      const context = Context.create()
      const someFunction = () => 123
      const identity1 = context['resolve'](someFunction)
      const identity2 = context['resolve'](someFunction)
      expect(identity1).toBe(identity2)
    })

    it('ensures identities are unique for different functions', () => {
      const context = Context.create()
      const someFunction_0 = () => '1'
      const someFunction_1 = () => '2'
      const result_0 = context.resolve(someFunction_0)
      const result_1 = context.resolve(someFunction_1)
      expect(result_0).toBe('1')
      expect(result_1).toBe('2')
    })
  })

  describe('clear', () => {
    it('evicts cached result and re-resolves', () => {
      const context = Context.create()
      const someFunction = jest.fn(() => Math.random())

      const result_0 = context.resolve(someFunction)
      context.clear()
      const result_1 = context.resolve(someFunction)

      expect(result_0).not.toBe(result_1)
      expect(someFunction).toHaveBeenCalledTimes(2)
    })
  })
})
