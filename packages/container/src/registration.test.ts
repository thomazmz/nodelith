import * as Types from '@nodelith/types'
import * as Injection from './index'

describe('Registration', () => {

  const token = 'token'

  const bundle: Injection.Bundle = {
    dependency: 'someDependency' 
  }

  describe('ValueRegistration', () => {
    it('Should always resolve to the same result', () => {
      const value = 'some_value'

      const registration = new Injection.ValueRegistration(value)

      const resolution_0 = registration.resolution

      const resolution_1 = registration.resolution
      
      expect(resolution_0).toBe(value)

      expect(resolution_1).toBe(value)

      expect(resolution_0).toBe(resolution_1)
    })
  })

  describe('ResolverRegistration', () => {
    it('Should not postpone resolution', () => {
      
      let targetWasCalled = false

      type FactoryReturn = {
        value: string
      }

      const factory: Types.Factory<FactoryReturn> = () => {
        targetWasCalled = true
        return { value: 'resolved_value' }
      }

      const registration = new Injection.FactoryRegistration(factory)
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(false)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should always resolve to the same result', () => {
      const resolver: Types.Resolver = () => {
        return { value: 'resolved_value' }
      }
  
      const registration = new Injection.ResolverRegistration(resolver, { token })
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).toBe(resolution_2)
    })
  })

  describe('FactoryRegistration', () => {
    it('Should postpone resolution when initialization strategy is not explicitly set', () => {
      let targetWasCalled = false


      type FactoryReturn = {
        value: string
      }

      const factory: Types.Factory<FactoryReturn> = () => {
        targetWasCalled = true
        return { value: 'resolved_value' }
      }

      const registration = new Injection.FactoryRegistration(factory)
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(false)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should postpone resolution when initialization strategy is explicitly set to lazy', () => {
      let targetWasCalled = false


      type FactoryReturn = {
        value: string
      }

      const factory: Types.Factory<FactoryReturn> = () => {
        targetWasCalled = true
        return { value: 'resolved_value' }
      }

      const registration = new Injection.FactoryRegistration(factory, { initialization: 'lazy' })
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(false)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should not postpone resolution when initialization strategy is explicitly set to eager', () => {
      let targetWasCalled = false


      type FactoryReturn = {
        value: string
      }

      const factory: Types.Factory<FactoryReturn> = () => {
        targetWasCalled = true
        return { value: 'resolved_value' }
      }

      const registration = new Injection.FactoryRegistration(factory, { initialization: 'eager' })
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(true)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should always resolve to the same result when lifetime strategy is not explicitly set', () => {
      const factory: Types.Factory = () => {
        return { value: 'resolved_value' }
      }
  
      const registration = new Injection.FactoryRegistration(factory, { token, bundle })
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).toBe(resolution_2)
    })

    it('Should always resolve to the same result when lifetime strategy is explicitly set as singleton', () => {
      const factory: Types.Factory = () => {
        return { value: 'resolved_value' }
      }
  
      const registration = new Injection.FactoryRegistration(factory, { token, bundle, lifetime: 'singleton' })
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).toBe(resolution_2)
    })

    it('Should always resolve to a different result when lifetime strategy is explicitly set as transient', () => {
      const factory: Types.Factory = () => {
        return { value: 'resolved_value' }
      }
  
      const registration = new Injection.FactoryRegistration(factory, { token, bundle, lifetime: 'transient',})
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).not.toBe(resolution_2)
    })

    it('Should throw error on attempt to set property values through registration result', () => {
      const factory: Types.Factory = () => {
        return { value: 'resolved_value' }
      }

      const registration = new Injection.FactoryRegistration(factory)

      expect(() => {
        registration.resolution['propertyKey'] = 'value'
      }).toThrow(
        `Could not set dependency property "propertyKey". Dependency properties can not be set through registration result.`
      )
    })
  })

  describe('ConstructorRegistration', () => {
    it('Should postpone resolution when initialization strategy is not explicitly set', () => {
      let targetWasCalled = false

      class Constructor { 
        public readonly value = 'resolved_value'

        constructor() { 
          targetWasCalled = true
        }        
      }

      const registration = new Injection.ConstructorRegistration(Constructor)
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(false)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should postpone resolution when initialization strategy is explicitly set to lazy', () => {
      let targetWasCalled = false

      class Constructor { 
        public readonly value = 'resolved_value'

        constructor() { 
          targetWasCalled = true
        }        
      }

      const registration = new Injection.ConstructorRegistration(Constructor, { initialization: 'lazy' })
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(false)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should not postpone resolution when initialization strategy is explicitly set to eager', () => {
      let targetWasCalled = false

      class Constructor { 
        public readonly value = 'resolved_value'

        constructor() { 
          targetWasCalled = true
        }        
      }

      const registration = new Injection.ConstructorRegistration(Constructor, { initialization: 'eager' })
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(true)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should always resolve to the same result when lifetime strategy is not explicitly set', () => {
      class Constructor {}
  
      const registration = new Injection.ConstructorRegistration(Constructor, { bundle })
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).toBe(resolution_2)
    })

    it('Should always resolve to the same result when lifetime strategy is explicitly set as singleton', () => {
      class Constructor {}
  
      const registration = new Injection.ConstructorRegistration(Constructor, { lifetime: 'singleton' })
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).toBe(resolution_2)
    })

    it('Should always resolve to a different result when lifetime strategy is explicitly set as transient', () => {
      class Constructor {}
  
      const registration = new Injection.ConstructorRegistration(Constructor, { lifetime: 'transient',})
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).not.toBe(resolution_2)
    })

    it('Should throw error on attempt to set property values through registration result', () => {
      class Constructor {}

      const registration = new Injection.ConstructorRegistration(Constructor)

      expect(() => {
        registration.resolution['propertyKey'] = 'value'
      }).toThrow(
        `Could not set dependency property "propertyKey". Dependency properties can not be set through registration result.`
      )
      
    })
  })
})
