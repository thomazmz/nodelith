import { Bundle } from './bundle'
import { Module } from './module'

describe('Module', () => {
  class Constructor {
    public value: number
    constructor() {
      this.value = 123
    }
  }

  const factory = () => ({
    value: 123
  })

  describe('resolve', () => {
    it('throws when resolving an unregistered token', () => {
      const module = new Module()
      const token = 'unregistered'

      expect(() => module.resolve(token)).toThrow(
        `Could not resolve token "${token}". Module does not contain a registration associated to the given token.`
      )
    })

    it('throws when resolving a private registration', () => {
      const module = new Module()
      const token = 'token'

      module.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
        visibility: 'private',
      })

      expect(() => module.resolve(token)).toThrow(
        `Could not resolve token "${token.toString()}". Module does not expose a registration associated to the given token.`
      )
    })
  })
  
  describe('exposes', () => {
    it('returns true for a "public" registration', () => {
      const module = new Module()
      const token = 'token'
  
      module.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
        visibility: 'public',
      })
  
      expect(module.exposes(token)).toBe(true)
    })
  
    it('returns false for a "private" registration', () => {
      const module = new Module()
      const token = 'token'
  
      module.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
        visibility: 'private',
      })
  
      expect(module.exposes(token)).toBe(false)
    })
  })

  describe('register', () => {
    it('uses implicit "public" visibility as default visibility', () => {
      const module = new Module()
      const token = 'token'

      module.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
      })

      expect(module.exposes(token)).toBe(true)
      expect(module.registrations.length).toBe(1)
    })

    it('uses explicit "public" visibility', () => {
      const module = new Module()
      const token = 'token'

      module.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
        visibility: 'public',
      })

      expect(() => module.resolve(token)).not.toThrow()
      expect(module.registrations.length).toBe(1)
    })

    it('uses explicit "private" visibility', () => {
      const module = new Module()
      const token = 'token'

      module.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
        visibility: 'private',
      })

      expect(module.registrations.length).toBe(0)
    })

    it('throws when registering the same token twice', () => {
      const module = new Module()
      const token = 'test'

      module.register(token, {
        lifecycle: 'transient',
        constructor: Constructor,
      })

      const register = () => {
        module.register(token, {
          lifecycle: 'transient',
          constructor: Constructor,
        })
      }

      expect(() => register()).toThrow(
        `Could not register token "${token}". Module already contains a registration assigned to the same token.`
      )
    })

    it('throws if no valid registration target is not passed', () => {
      const module = new Module()
      const token = 'token'

      // @ts-expect-error
      expect(() => module.register(token, { lifecycle: 'transient' })).toThrow(
        "Could not create resolver. Invalid registration options."
      )
    })
  })

  describe('registerFactory', () => {
    it('registers a factory and resolves it', () => {
      const module = new Module()
      const token = 'factory'

      module.registerFactory(token, factory, {
        lifecycle: 'transient',
        visibility: 'public',
      })

      const resolution = module.resolve(token)
      expect(resolution).toEqual({ value: 123 })
    })
  })

  describe('registerConstructor', () => {
    it('registers a constructor and resolves it', () => {
      const module = new Module()
      const token = 'constructor'

      module.registerConstructor(token, Constructor, {
        lifecycle: 'transient',
        visibility: 'public',
      })

      const resolution = module.resolve(token)
      expect(resolution).toBeInstanceOf(Constructor)
      expect(resolution).toEqual({ value: 123 })
    })
  })

  describe('clone', () => {
    it('creates a new Module instance', () => {
      const module = new Module()
      const clone = module.clone()
      expect(clone).toBeInstanceOf(Module)
      expect(clone).not.toBe(module)
    })

    it('copies public and private registrations to the clone', () => {
      const module = new Module()
      const tokenPublic = 'publicToken'
      const tokenPrivate = 'privateToken'

      class PrivateDependency {
        public value = 123
      }

      class PublicDependency {
        public dependency: PrivateDependency
        public constructor(dependencies: Bundle) {
          this.dependency = dependencies[tokenPrivate]
        }
      }

      module.register(tokenPrivate, {
        constructor: PrivateDependency,
        lifecycle: 'transient',
        visibility: 'private',
      })

      module.register(tokenPublic, {
        constructor: PublicDependency,
        lifecycle: 'transient',
        visibility: 'public',
      })

      const clone = module.clone()
      const resolved = clone.resolve<PublicDependency>(tokenPublic)

      expect(resolved).toBeInstanceOf(PublicDependency)
      expect(resolved.dependency).toBeInstanceOf(PrivateDependency)
      expect(resolved.dependency.value).toBe(123)
    })

    it('mutations to the clone do not affect the original module', () => {
      const token = 'token'

      const module = new Module()
      module.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
        visibility: 'public',
      })

      const clone = module.clone()
      expect(() => clone.register(token, {
        constructor: Constructor,
        lifecycle: 'transient',
        visibility: 'public',
      })).toThrow()

      expect(() => clone.resolve(token)).not.toThrow()
      expect(() => module.resolve(token)).not.toThrow()
    })
  })

  describe('module composition and resolve with imports (scoped exposure)', () => {
    it('should not expose public registrations from child module', () => {
      const token_0 = 'dependency_0'
      const token_1 = 'dependency_1'
    
      const factory_0 = (bundle: Bundle) => ({
        token: token_0,
      })
    
      const factory_1 = () => ({ 
        token: token_1 
      })
    
      const module_0 = new Module()
      const module_1 = new Module()
    
      module_0.registerFactory(token_0, factory_0, { visibility: 'public' })
      module_1.registerFactory(token_1, factory_1, { visibility: 'public' })
      module_0.import(module_1)

      const expectedErrorMessage = `Could not resolve token "${token_1}". Module does not contain a registration associated to the given token.`
    
      expect(() => { module_0.resolve(token_1) }).toThrow(expectedErrorMessage)
    })

    it('should expose public registrations to upstream modules', () => {
      const token_0 = 'token_0'
      const token_1 = 'token_1'
    
      const factory_0 = jest.fn((bundle: Bundle) => ({ 
        token: token_0,
        [token_1]: bundle[token_1].token,
      }))
    
      const factory_1 = jest.fn(() => ({ 
        token: token_1,
      }))

      const module_0 = new Module()
      const module_1 = new Module()
    
      module_0.registerFactory(token_0, factory_0, { visibility: 'public' })
      module_1.registerFactory(token_1, factory_1, { visibility: 'public' })

      module_0.import(module_1)

      const resolution = module_0.resolve(token_0)

      //@ts-expect-error
      expect(resolution.token).toBe(token_0)
      //@ts-expect-error
      expect(resolution.token_1).toBe(token_1)
    })

    it('should not expose public registrations to downstream modules', () => {
      const token_0 = 'dependency_0'
      const token_1 = 'dependency_1'
    
      const factory_0 = jest.fn((bundle: Bundle) => ({
        [token_1]: bundle[token_1].token
      }))

      const factory_1 = jest.fn((bundle: Bundle) => ({
        [token_0]: bundle[token_0].token
      }))

      const module_0 = new Module()
      const module_1 = new Module()
      
      module_0.registerFactory(token_0, factory_0, { visibility: 'public' })
      module_1.registerFactory(token_1, factory_1, { visibility: 'public' })

      module_0.import(module_1)

      expect(() => module_0.resolve(token_0)).toThrow()

      expect(factory_0).toHaveBeenCalledTimes(1)
      expect(factory_1).toHaveBeenCalledTimes(1)
    })
  })
})
