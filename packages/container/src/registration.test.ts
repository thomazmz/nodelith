import { 
  StaticRegistration,
  FactoryRegistration,
  ResolverRegistration,
  ConstructorRegistration,
} from './registration'

import { 
  Factory,
  Resolver,
} from '@nodelith/types'

describe('Registration', () => {
  describe('StaticRegistration', () => {
    it('Should always resolve to the same result', () => {
      const value = 'some_value'
  
      const registration = new StaticRegistration(value)
  
      const resolution_0 = registration.resolution
  
      const resolution_1 = registration.resolution
      
      expect(resolution_0).toBe(value)
  
      expect(resolution_1).toBe(value)
  
      expect(resolution_0).toBe(resolution_1)
    })
  }) 

  describe('ResolverRegistration', () => {
    type ResolverReturn = {
      value: string
    }

    it('Should not postpone resolution', () => {
      
      let targetWasCalled = false
  
      const resolver: Resolver<ResolverReturn> = () => {
        targetWasCalled = true
        return { value: 'resolved_value' }
      }
  
      const registration = new ResolverRegistration(resolver)
      expect(targetWasCalled).toBe(false)
  
      registration.resolution
      expect(targetWasCalled).toBe(true)
  
      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })
  
    it('Should always resolve to the same result', () => {
      const resolver: Resolver<ResolverReturn> = () => {
        return { value: 'resolved_value' }
      }
  
      const registration = new ResolverRegistration(resolver)
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution
  
      expect(resolution_1).toBe(resolution_2)
    })
  }) 

  describe('FactoryRegistration', () => {
    it('Should postpone resolution', () => {
      let targetWasCalled = false

      type FactoryReturn = {
        value: string
      }

      const factory: Factory<FactoryReturn> = () => {
        targetWasCalled = true
        return { value: 'resolved_value' }
      }

      const registration = new FactoryRegistration(factory)
      expect(targetWasCalled).toBe(false)

      registration.resolution
      expect(targetWasCalled).toBe(false)

      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })

    it('Should always resolve to the same result when lifetime strategy is not explicitly set', () => {
      const factory: Factory = () => {
        return { value: 'resolved_value' }
      }

      const registration = new FactoryRegistration(factory)
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).toBe(resolution_2)
    })

    it('Should always resolve to the same result when lifetime strategy is explicitly set as singleton', () => {
      const factory: Factory = () => {
        return { value: 'resolved_value' }
      }

      const registration = new FactoryRegistration(factory, { lifetime: 'singleton' })
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).toBe(resolution_2)
    })

    it('Should always resolve to a different result when lifetime strategy is explicitly set as transient', () => {
      const factory: Factory = () => {
        return { value: 'resolved_value' }
      }

      const registration = new FactoryRegistration(factory, { lifetime: 'transient',})
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution

      expect(resolution_1).not.toBe(resolution_2)
    })

    it('Should throw error on attempt to set property values through registration result', () => {
      const factory: Factory = () => {
        return { value: 'resolved_value' }
      }

      const registration = new FactoryRegistration(factory)
      
      expect(() => {
        registration.resolution['propertyKey'] = 'value'
      }).toThrow(
        `Could not set property "propertyKey". Properties can not be set through registration.`
      )
    })
  })

  describe('ConstructorRegistration', () => {
    it('Should postpone resolution', () => {
      let targetWasCalled = false
  
      class Constructor { 
        public readonly value = 'resolved_value'
  
        constructor() { 
          targetWasCalled = true
        }        
      }
  
      const registration = new ConstructorRegistration(Constructor)
      expect(targetWasCalled).toBe(false)
  
      registration.resolution
      expect(targetWasCalled).toBe(false)
  
      registration.resolution.value
      expect(targetWasCalled).toBe(true)
    })
  
    it('Should always resolve to the same result when lifetime strategy is not explicitly set', () => {
      class Constructor {}
  
      const registration = new ConstructorRegistration(Constructor)
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution
  
      expect(resolution_1).toBe(resolution_2)
    })
  
    it('Should always resolve to the same result when lifetime strategy is explicitly set as singleton', () => {
      class Constructor {}
  
      const registration = new ConstructorRegistration(Constructor, { lifetime: 'singleton' })
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution
  
      expect(resolution_1).toBe(resolution_2)
    })
  
    it('Should always resolve to a different result when lifetime strategy is explicitly set as transient', () => {
      class Constructor {}
  
      const registration = new ConstructorRegistration(Constructor, { lifetime: 'transient',})
      const resolution_1 = registration.resolution
      const resolution_2 = registration.resolution
  
      expect(resolution_1).not.toBe(resolution_2)
    })
  
    it('Should throw error on attempt to set property values through registration result', () => {
      class Constructor {}
  
      const registration = new ConstructorRegistration(Constructor)
  
      expect(() => {
        registration.resolution['propertyKey'] = 'value'
      }).toThrow(
        `Could not set property "propertyKey". Properties can not be set through registration.`
      )
      
    })
  })
})