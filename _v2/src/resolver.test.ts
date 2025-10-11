import { createResolver } from './resolver'
import { Identity } from './identity'

describe('Resolver', () => {

  it('creates a lazy resolver from a factory', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect(result.foo).toEqual('bar')
  })

  it('creates a lazy resolver from a constructor', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect(result.foo).toBe('bar')
    expect(result).toBeInstanceOf(Target)
  })

  it('creates an eager resolver from a factory', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({ 
      factory: target,
      resolution: 'eager'
    })

    const result = resolver({})
    expect(result.foo).toEqual('bar')
  })

  it('creates an eager resolver from a constructor', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'eager'
    })

    const result = resolver({})
    expect(result.foo).toBe('bar')
    expect(result).toBeInstanceOf(Target)
  })

  it('binds constructor identity to lazy resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({ 
      constructor: Target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect(result.foo).toBe('bar')
    expect(result).toBeInstanceOf(Target)

    const targetId = Identity.extract(Target)
    const resolverId = Identity.extract(resolver)
    expect(resolverId).toBe(targetId)
  })

  it('binds factory identity to lazy resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({ 
      factory: target,
      resolution: 'lazy'
    })

    const targetId = Identity.extract(target)
    const resolverId = Identity.extract(resolver)
    expect(resolverId).toBe(targetId)
  })

  it('binds constructor identity to eager resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({ 
      constructor: Target,
      resolution: 'eager'
    })

    const result = resolver({})
    expect(result).toBeInstanceOf(Target)
    expect(result.foo).toBe('bar')

    const targetId = Identity.extract(Target)
    const resolverId = Identity.extract(resolver)
    expect(resolverId).toBe(targetId)
  })

  it('binds factory identity to eager resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({ 
      factory: target,
      resolution: 'eager'
    })

    const factoryId = Identity.extract(target)
    const resolverId = Identity.extract(resolver)
    expect(resolverId).toBe(factoryId)
  })

  it('binds function identity to resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      function: target
    })

    const targetId = Identity.extract(target)
    const resolverId = Identity.extract(resolver)
    expect(resolverId).toBe(targetId)
  })

  it('initializes lazy factory resolver instance only when accessed', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect(target).toHaveBeenCalledTimes(0)
    
    result.foo
    expect(target).toHaveBeenCalledTimes(1)
    
    result.foo
    expect(target).toHaveBeenCalledTimes(1)
  })

  it('initializes lazy constructor resolver instance only when accessed', () => {
    const counter = jest.fn();

    class Target {
      foo = 'bar';
      constructor() {
        counter()
      }
    }
  
    const resolver = createResolver({ 
      constructor: Target,
      resolution: 'lazy'
    });
  
    const result = resolver({}) as Target;
    expect(counter).toHaveBeenCalledTimes(0);
  
    result.foo;
    expect(counter).toHaveBeenCalledTimes(1);
  
    result.foo;
    expect(counter).toHaveBeenCalledTimes(1);
  })

  it('supports property existence check in lazy factory resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect('foo' in result).toBe(true)
    expect('nonexistent' in result).toBe(false)
  })

  it('supports property existence check in eager factory resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'eager'
    })

    const result = resolver({})
    expect('foo' in result).toBe(true)
    expect('nonexistent' in result).toBe(false)
  })

  it('supports property existence check in lazy constructor resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect('foo' in result).toBe(true)
    expect('nonexistent' in result).toBe(false)
  })

  it('supports property existence check in eager constructor resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'eager'
    })

    const result = resolver({})
    expect('foo' in result).toBe(true)
    expect('nonexistent' in result).toBe(false)
  })

  it('supports Object.keys enumeration in lazy factory resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect(Object.keys(result)).toEqual(['foo'])
  })

  it('supports Object.keys enumeration in eager factory resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'eager'
    })

    const result = resolver({})
    expect(Object.keys(result)).toEqual(['foo'])
  })

  it('supports Object.keys enumeration in lazy constructor resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'lazy'
    })

    const result = resolver({})
    expect(Object.keys(result)).toEqual(['foo'])
  })

  it('supports Object.keys enumeration in eager constructor resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'eager'
    })

    const result = resolver({})
    expect(Object.keys(result)).toEqual(['foo'])
  })

  it('supports Object.getOwnPropertyDescriptor in lazy factory resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'lazy'
    })

    const result = resolver({})
    const descriptor = Object.getOwnPropertyDescriptor(result, 'foo')
    expect(descriptor).toBeDefined()
    expect(descriptor!.value).toBe('bar')
    expect(descriptor!.writable).toBe(true)
  })

  it('supports Object.getOwnPropertyDescriptor in eager factory resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'lazy'
    })

    const result = resolver({})
    const descriptor = Object.getOwnPropertyDescriptor(result, 'foo')
    expect(descriptor).toBeDefined()
    expect(descriptor!.value).toBe('bar')
    expect(descriptor!.writable).toBe(true)
  })

  it('supports Object.getOwnPropertyDescriptor in lazy constructor resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'lazy'
    })

    const result = resolver({})
    const descriptor = Object.getOwnPropertyDescriptor(result, 'foo')
    expect(descriptor).toBeDefined()
    expect(descriptor!.value).toBe('bar')
    expect(descriptor!.writable).toBe(true)
  })

  it('supports Object.getOwnPropertyDescriptor in eager constructor resolver', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'lazy'
    })

    const result = resolver({})
    const descriptor = Object.getOwnPropertyDescriptor(result, 'foo')
    expect(descriptor).toBeDefined()
    expect(descriptor!.value).toBe('bar')
    expect(descriptor!.writable).toBe(true)
  })

  it('supports property modification in lazy factory resolver result', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'lazy'
    })

    const result = resolver({})
    result.foo = 'modified'
    expect(result.foo).toBe('modified')
  })
  
  it('supports property modification in eager factory resolver result', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      factory: target,
      resolution: 'eager'
    })

    const result = resolver({})
    result.foo = 'modified'
    expect(result.foo).toBe('modified')
  })

  it('supports property modification in lazy constructor resolver result', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'lazy'
    })

    const result = resolver({})
    result.foo = 'modified'
    expect(result.foo).toBe('modified')
  })
  
  it('supports property modification in eager constructor resolver result', () => {
    class Target { foo = 'bar' }

    const resolver = createResolver({
      constructor: Target,
      resolution: 'eager'
    })

    const result = resolver({})
    result.foo = 'modified'
    expect(result.foo).toBe('modified')
  })

  it('create resolvers for static object values', () => {
    const staticValue = { foo: 'bar', baz: 123 }

    const resolver = createResolver<typeof staticValue>({
      static: staticValue
    })

    const result = resolver({})
    expect(result).toBe(staticValue)
    expect(result.foo).toBe('bar')
    expect(result.baz).toBe(123)
  })

  it('create resolvers for functions returning object values', () => {
    const target = jest.fn((bundle) => ({ foo: 'bar', ...bundle }))

    const resolver = createResolver({
      function: target
    })

    const bundle = { fizz: 'buzz' }
    const result = resolver(bundle)
    
    expect(target).toHaveBeenCalledWith(bundle)

    expect(result.foo).toBe('bar')
    expect(result.fizz).toBe('buzz')
  })

  it('create resolvers for static primitive values', () => {
    const staticValue = 'hello world'

    const resolver = createResolver<string>({
      static: staticValue
    })

    const result = resolver({})
    expect(result).toBe(staticValue)
    expect(typeof result).toBe('string')
  })

  it('create resolvers for functions returning primitive values', () => {
    const target = jest.fn((bundle) => `processed: ${bundle.fizz}`)

    const resolver = createResolver({
      function: target
    })

    const bundle = { fizz: 'buzz' }
    const result = resolver(bundle)
    
    expect(target).toHaveBeenCalledWith(bundle)
    expect(result).toBe('processed: buzz')
  })

  it('create resolvers for static null values', () => {
    const resolver = createResolver<null>({
      static: null
    })

    const result = resolver({})
    expect(result).toBe(null)
  })

  it('create resolvers for functions returning null values', () => {
    const target = jest.fn(() => null)

    const resolver = createResolver({
      function: target
    })

    const result = resolver({})
    
    expect(target).toHaveBeenCalledWith({})
    expect(result).toBe(null)
  })

  it('create resolvers for static undefined values', () => {
    const resolver = createResolver<undefined>({
      static: undefined
    })

    const result = resolver({})
    expect(result).toBe(undefined)
  })

  it('create resolvers for functions returning undefined values', () => {
    const target = jest.fn(() => undefined)

    const resolver = createResolver({
      function: target
    })

    const result = resolver({})
    
    expect(target).toHaveBeenCalledWith({})
    expect(result).toBe(undefined)
  })

  it('uses eager resolution for static resolver', () => {
    const target = { foo: 'bar' }

    const resolver = createResolver({
      static: target,
    })

    const result = resolver({})
    expect(result).toBe(target)
  })

  it('uses eager resolution for function resolver', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    const resolver = createResolver({
      function: target,
    })

    const result = resolver({})
    expect(target).toHaveBeenCalledWith({})
    expect(result.foo).toBe('bar')
  })

  it('should resolve function dependencies based on positional parameter identifiers', () => {
    const target = (prefix: string, suffix: string) => `${prefix}:${suffix}`

    const resolver = createResolver({
      injection: 'positional',
      function: target,
    })

    const result = resolver({
      prefix: 'prefix',
      suffix: 'suffix'
    })

    expect(result).toBe('prefix:suffix')
  })

  it('should resolve factory dependencies based on positional parameter identifiers', () => {
    const target = (prefix: string, suffix: string) => ({ 
      value: `${prefix}:${suffix}` 
    })

    const resolver = createResolver({
      injection: 'positional',
      factory: target,
    })

    const result = resolver({
      prefix: 'prefix',
      suffix: 'suffix'
    })

    expect(result).toEqual({ 
      value: 'prefix:suffix'
    })
  })

  it('should resolve constructor dependencies based on positional parameter identifiers', () => {
    class Target {
      public value: string
      constructor(prefix: string, suffix: string) {
        this.value = `${prefix}:${suffix}`
      }
    }

    const resolver = createResolver({
      injection: 'positional',
      constructor: Target,
    })

    const result = resolver({
      prefix: 'prefix',
      suffix: 'suffix'
    })

    expect(result).toBeInstanceOf(Target)

    expect(result).toEqual({
      value: 'prefix:suffix'
    })
  })

  it('throws error for static resolver with lazy resolution', () => {
    const target = { foo: 'bar' }

    expect(() => {
      createResolver({
        static: target,
        // @ts-expect-error
        resolution: 'super_lazy'
      })
    }).toThrow(`Could not create resolver. Invalid "super_lazy" resolution option for static target.`)
  })

  it('throws error for function resolver with lazy resolution', () => {
    const target = jest.fn(() => ({ foo: 'bar' }))

    expect(() => {
      createResolver({
        function: target,
        // @ts-expect-error
        resolution: 'super_lazy'
      })
    }).toThrow(`Could not create resolver. Invalid "super_lazy" resolution option for function target.`)
  })
})
