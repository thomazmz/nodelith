import { Registration } from './registration'
import { Container } from './container'
import { Resolver } from './resolver'
import { Context } from './context'
import { Bundle } from './bundle'
import { Token } from './token'
import { randomUUID } from 'crypto'

describe('Container (integration)', () => {
  it('should resolve value by token', () => {
    const container = Container.create()

    const token = container.register('token', Registration.create({
      function: () => 'value'
    }))

    const result = container.resolve(token)
    expect(result).toBe('value')
  })

  it('should resolve a singleton object registration', () => {
    const container = Container.create()

    const token = container.register('token', Registration.create({
      factory: () => ({ value: 123}),
      lifecycle: 'singleton',
    }))

    const result = container.resolve(token)
    expect(result.value).toBe(123)
  })

  it('should resolve a transient object registration', () => {
    const container = Container.create()

    const token = container.register('token', Registration.create({
      factory: () => ({ value: 123}),
      lifecycle: 'transient',
    }))

    const result = container.resolve(token)
    expect(result.value).toBe(123)
  })

  it('should resolve a scoped object registration', () => {
    const context = Context.create()
    const container = Container.create()

    const token = container.register('token', Registration.create({
      factory: () => ({ value: 123}),
      lifecycle: 'scoped',
    }))

    const result = container.resolve(token, { context })
    expect(result.value).toBe(123)
  })

  it('should resolve scoped object registration using context', () => {
    const context = Context.create()
    const container = Container.create()
    
    const spy = jest.spyOn(context, 'resolve')

    const token = container.register('token', Registration.create({
      factory: () => ({ value: 123 }),
      lifecycle: 'scoped'
    }))
  
    expect(spy).not.toHaveBeenCalled()

    const resolution_0 = container.resolve(token, { context })
    expect(spy).toHaveBeenCalledTimes(1)

    const resolution_1 = container.resolve(token, { context })
    expect(spy).toHaveBeenCalledTimes(2)
    
    expect(resolution_0).toBe(resolution_1)
  })

  it('should resolve singleton object registration using context', () => {
    const context = Context.create()
    const container = Container.create({ context })
    
    const spy = jest.spyOn(context, 'resolve')

    const token = container.register('token', Registration.create({
      factory: () => ({ value: 123 }),
      lifecycle: 'singleton'
    }))
  
    expect(spy).not.toHaveBeenCalled()

    const resolution_0 = container.resolve(token)
    expect(spy).toHaveBeenCalledTimes(1)

    const resolution_1 = container.resolve(token)
    expect(spy).toHaveBeenCalledTimes(2)
    
    expect(resolution_0).toBe(resolution_1)
  })

  it('should resolve transient object registration creating new instance', () => {
    const context = Context.create()
    const container = Container.create()
  
    const token = container.register('token', Registration.create({
      function: () => randomUUID(),
      lifecycle: 'transient',
    }))

    const resolution_0 = container.resolve(token, { context })
    const resolution_1 = container.resolve(token, { context })
    expect(resolution_0).not.toBe(resolution_1)
  })

  it('should resolve acyclic dependency when bundle is left untouched', () => {
    const container = Container.create()

    const target_0 = () => ({
      call: () => 'calledTarget0'
    })
  
    const target_1 = (bundle: Bundle) => ({ 
      call: () => 'calledTarget1',
      callTarget0: () => bundle.target0?.call(),
    })

    const target_2  = (bundle: Bundle) => ({ 
      call: () => 'calledTarget2',
      callTarget0: () => bundle.target0?.call(),
      callTarget1: () => bundle.target1?.call(),
    })

    const targetToken_0 = container.register('target0', Registration.create({ factory: target_0 }))
    const targetToken_1 = container.register('target1', Registration.create({ factory: target_1 }))
    const targetToken_2 = container.register('target2', Registration.create({ factory: target_2 }))

    expect((container.resolve(targetToken_0).call())).toBe('calledTarget0')
    expect((container.resolve(targetToken_1).call())).toBe('calledTarget1')
    expect((container.resolve(targetToken_2).call())).toBe('calledTarget2')

    expect((container.resolve(targetToken_1).callTarget0())).toBe('calledTarget0')
    expect((container.resolve(targetToken_2).callTarget0())).toBe('calledTarget0')

    expect((container.resolve(targetToken_2).callTarget1())).toBe('calledTarget1')
  })

  it('should resolve acyclic dependency when not destructuring bundle', () => {
    const container = Container.create()

    const target_0 = () => ({
      call: () => 'calledTarget0'
    })
  
    const target_1 = (bundle: Bundle) => {
      const target0 = bundle.target0
      return { 
        call: () => 'calledTarget1',
        callTarget0: () => target0?.call(),
      }
    }

    const target_2  = (bundle: Bundle) => {
      const target0 = bundle.target0
      const target1 = bundle.target1
      return { 
        call: () => 'calledTarget2',
        callTarget0: () => target0?.call(),
        callTarget1: () => target1?.call(),
      }
    }

    const targetToken_0 = container.register('target0', Registration.create({ factory: target_0 }))
    const targetToken_1 = container.register('target1', Registration.create({ factory: target_1 }))
    const targetToken_2 = container.register('target2', Registration.create({ factory: target_2 }))

    expect((container.resolve(targetToken_0).call())).toBe('calledTarget0')
    expect((container.resolve(targetToken_1).call())).toBe('calledTarget1')
    expect((container.resolve(targetToken_2).call())).toBe('calledTarget2')

    expect((container.resolve(targetToken_1).callTarget0())).toBe('calledTarget0')
    expect((container.resolve(targetToken_2).callTarget0())).toBe('calledTarget0')

    expect((container.resolve(targetToken_2).callTarget1())).toBe('calledTarget1')
  })

  it('should resolve acyclic dependency graph when destructuring bundle', () => {
    const container = Container.create()

    const target_0 = () => ({
      call: () => 'calledTarget0'
    })
  
    const target_1 = ({ target0 }: Bundle) => ({ 
      call: () => 'calledTarget1',
      callTarget0: () => target0?.call(),
    })

    const target_2  = ({ target0, target1 }: Bundle) => ({ 
      call: () => 'calledTarget2',
      callTarget0: () => target0?.call(),
      callTarget1: () => target1?.call(),
    })

    const targetToken_0 = container.register('target0', Registration.create({ factory: target_0 }))
    const targetToken_1 = container.register('target1', Registration.create({ factory: target_1 }))
    const targetToken_2 = container.register('target2', Registration.create({ factory: target_2 }))

    expect((container.resolve(targetToken_0).call())).toBe('calledTarget0')
    expect((container.resolve(targetToken_1).call())).toBe('calledTarget1')
    expect((container.resolve(targetToken_2).call())).toBe('calledTarget2')

    expect((container.resolve(targetToken_1).callTarget0())).toBe('calledTarget0')
    expect((container.resolve(targetToken_2).callTarget0())).toBe('calledTarget0')

    expect((container.resolve(targetToken_2).callTarget1())).toBe('calledTarget1')
  })

  it('should resolve cyclic dependency graph when bundle is left untouched', () => {
    const container = Container.create()

    const target_0 = (bundle: Bundle) => ({
      call: () => 'calledTarget0',
      callDependency: () => bundle.target1?.call(),
    })

    const target_1 = (bundle: Bundle) => ({
      call: () => 'calledTarget1',
      callDependency: () => bundle.target0?.call(),
    })

    const resolver_0 = Resolver.create({
      factory: target_0,
      resolution: 'lazy',
    })

    const resolver_1 = Resolver.create({
      factory: target_1,
      resolution: 'lazy',
    })

    const targetToken_0 = container.register('target0', Registration.create({ factory: resolver_0 }))
    const targetToken_1 = container.register('target1', Registration.create({ factory: resolver_1 }))

    expect((container.resolve(targetToken_0) as any).call()).toBe('calledTarget0')
    expect((container.resolve(targetToken_1) as any).call()).toBe('calledTarget1')

    expect((container.resolve(targetToken_0) as any).callDependency()).toBe('calledTarget1')
    expect((container.resolve(targetToken_1) as any).callDependency()).toBe('calledTarget0')
  })

  it('should resolve cyclic dependency graph when not destructuring bundle', () => {
    const container = Container.create()

    const target_0 = (bundle: Bundle) => {
      const target1 = bundle.target1
      return {
        call: () => 'calledTarget_0',
        callDependency: () => target1.call(),
      }
    }

    const target_1 = (bundle: Bundle) => {
      const target_0 = bundle.target0
      return {
        call: () => 'calledTarget_1',
        callDependency: () => target_0.call(),
      }
    }

    const resolver_0 = Resolver.create({
      factory: target_0,
      resolution: 'lazy',
    })

    const resolver_1 = Resolver.create({
      factory: target_1,
      resolution: 'lazy',
    })

    const targetToken_0 = container.register('target0', Registration.create({ factory: resolver_0 }))
    const targetToken_1 = container.register('target1', Registration.create({ factory: resolver_1 }))

    expect((container.resolve(targetToken_0)).call()).toBe('calledTarget_0')
    expect((container.resolve(targetToken_1)).call()).toBe('calledTarget_1')

    expect((container.resolve(targetToken_0)).callDependency()).toBe('calledTarget_1')
    expect((container.resolve(targetToken_1)).callDependency()).toBe('calledTarget_0')
  })

  it('should resolve cyclic dependency graph when destructuring bundle', () => {
    const container = Container.create()

    const target_0 = ({ target1 }: Bundle) => ({
      call: () => 'calledTarget_0',
      callDependency: () => target1.call(),
    })

    const target_1 = ({ target0 }: Bundle) => ({
      call: () => 'calledTarget_1',
      callDependency: () => target0.call(),
    })

    const resolver_0 = Resolver.create({
      factory: target_0,
      resolution: 'lazy',
    })

    const resolver_1 = Resolver.create({
      factory: target_1,
      resolution: 'lazy',
    })

    const targetToken_0 = container.register('target0', Registration.create({ factory: resolver_0 }))
    const targetToken_1 = container.register('target1', Registration.create({ factory: resolver_1 }))

    expect((container.resolve(targetToken_0)).call()).toBe('calledTarget_0')
    expect((container.resolve(targetToken_1)).call()).toBe('calledTarget_1')

    expect((container.resolve(targetToken_0)).callDependency()).toBe('calledTarget_1')
    expect((container.resolve(targetToken_1)).callDependency()).toBe('calledTarget_0')
  })

  it('should throw when resolving cyclic dependency with eager registrations', () => {
    const container = Container.create()

    container.register('target0', Registration.create({
      function: (bundle: Bundle) => 'value0'
    }))

    container.register('target1', Registration.create({
      function: (bundle: Bundle) => `${bundle.target0}:${bundle.target2}`
    }))

    container.register('target2', Registration.create({
      function: (bundle: Bundle) => `${bundle.target1}`
    }))

    expect(() => {
      const t = container.resolve('target2')
      console.log(t)
    }).toThrow('Could not resolve registration. Unresolvable circular dependencies detected: target2 > target1 > target2')
  })

  it('should inject internal registrations', () => {
    const container = Container.create()

    const token_a = container.register('token', Registration.create({
      function: (bundle) => `${bundle[token_b]}-${bundle[token_c]}`
    }))

    const token_b = container.register('token_b', Registration.create({
      static: 'prefix',
    }))

    const token_c = container.register('token_x', Registration.create({
      static: 'suffix'
    }))

    const result = container.resolve(token_a)

    expect(result).toBe('prefix-suffix')
  })

  it('should inject registrations from external bundle', () => {
    const container = Container.create()

    const token_a = container.register('token', Registration.create({
      function: (bundle) => `${bundle.token_a}-${bundle.token_b}`
    }))

    const result = container.resolve(token_a, { bundle: {
      token_a: 'prefix',
      token_b: 'suffix',
    }})

    expect(result).toBe('prefix-suffix')
  })

  it('should use given resolution context to resolve scoped lifecycle', () => {
    const resolverMock = jest.fn(() => ({ value: 'scoped-value' }))

    const rootContext = Context.create()

    const rootContextSpy = jest.spyOn(rootContext, 'resolve')

    const resolutionContext = Context.create()

    const resolutionContextSpy = jest.spyOn(resolutionContext, 'resolve')

    const container = Container.create({ context: rootContext })
  
    const token = container.register('token_a', Registration.create({
      function: resolverMock,
      lifecycle: 'scoped'
    }))

    expect(resolutionContextSpy).toHaveBeenCalledTimes(0)
    expect(rootContextSpy).toHaveBeenCalledTimes(0)
    expect(resolverMock).toHaveBeenCalledTimes(0)
  
    const result_0 = container.resolve(token, { context: resolutionContext })
    expect(resolutionContextSpy).toHaveBeenCalledTimes(1)
    expect(rootContextSpy).toHaveBeenCalledTimes(0)
    expect(resolverMock).toHaveBeenCalledTimes(1)

    const result_1 = container.resolve(token, { context: resolutionContext })
    expect(resolutionContextSpy).toHaveBeenCalledTimes(2)
    expect(rootContextSpy).toHaveBeenCalledTimes(0)
    expect(resolverMock).toHaveBeenCalledTimes(1)
  
    expect(result_0).toEqual({ value: 'scoped-value' })
    expect(result_0).toBe(result_1)
  })

  it('should return false for unknown registration tokens', () => {
    const container = Container.create()
    expect(container.has('token_a')).toBe(false)
  })

  it('should return true for known registration tokens', () => {
    const container = Container.create()

    const token = container.register('token_a', Registration.create({
      factory: () => ({})
    }))

    expect(container.has(token)).toBe(true)
  })

  it('should return false for unkown registration tokens on the cloned container', () => {
    const container = Container.create()
    const clone = container.clone()
    expect(clone.has('token_a')).toBe(false)
  })

  it('should return true for known registration tokens on the cloned container', () => {
    const container = Container.create()

    const token = container.register('token_a', Registration.create({
      factory: () => ({})
    }))

    const clone = container.clone()
    expect(clone.has(token)).toBe(true)
  })

  it('should resolve token from registrations added to source container ', () => {
    const container = Container.create()

    const token = container.register('token_a', Registration.create({
      static: 123
    }))

    const cloned = container.clone()

    expect(cloned).not.toBe(container)
    expect(cloned.resolve(token)).toBe(123)
  })

  it('should return entries and registration list', () => {
    const container = Container.create()

    const registration = Registration.create({
      function: () => 123
    })

    const token = container.register('token_a', registration)
 
    expect(container.entries).toEqual([[token, expect.any(Registration)]])
    expect(container.registrations).toEqual([registration])
  })
})
