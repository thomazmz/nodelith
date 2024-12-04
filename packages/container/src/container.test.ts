import * as Types from '@nodelith/types'
import * as Injection from './index'

describe('Container', () => {

  let defaultResolverWasCalled = false
  let targetFactoryOneWasCalled = false
  let targetFactoryTwoWasCalled = false
  let targetFactoryDoubleWasCalled = false

  beforeEach(() => {
    defaultResolverWasCalled = false
    targetFactoryOneWasCalled = false
    targetFactoryTwoWasCalled = false
    targetFactoryDoubleWasCalled = false
  })

  const defaultResolver: Injection.Resolver = (target, ...args) => {
    defaultResolverWasCalled = true
    return target(...args)
  }

  const targetFactoryOne: Injection.Target = ({ targetTwo }) => {
    const call = () => 'targetOne::call'
    const callDependency = () => targetTwo.call()
    targetFactoryOneWasCalled = true
    return { call, callDependency }
  }

  const targetFactoryTwo: Injection.Target = ({ targetOne }) => {
    const call = () => 'targetTwo::call'
    const callDependency = () => targetOne.call()
    targetFactoryTwoWasCalled = true
    return { call, callDependency }
  }

  const targetFactoryDouble: Injection.Target = () => {
    const call = () => 'targetDouble::call'
    targetFactoryDoubleWasCalled = true
    return { call }
  }

  describe('registration', () => {

    const container = new Injection.Container()
  
    const registrationOne = new Injection.FactoryRegistration(targetFactoryOne, {
      token: 'targetOne',
      bundle: container.bundle,
      resolver: defaultResolver,
    })

    container.push(registrationOne)
    
    it('Should throw error on attempt to set dependency through bundle object', () => {
      expect(() => container.bundle['key'] = 'value').toThrow(
        `Could not set registration "key". Registration should not be done through bundle.`
      )
    })
    
    it('Should throw error on attempt to access invalid registration token', () => {
      expect(() => container.bundle['key']).toThrow(
        `Could not resolve dependency "key". Invalid registration token.`
      )
    })
    
    it('Should throw error on attempt to set properties through registration bundle values', () => {
      expect(() => container.bundle['targetOne']['key'] = 'value').toThrow(
        `Could not set dependency property "key". Dependency properties cannot be set through registration bundle.`
      )
    })
  })

  describe('resolution', () => {
    it('Should resolve acyclic dependency graph', () => {
      const container = new Injection.Container()
  
      const registrationOne = new Injection.FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
  
      const registrationTwo = new Injection.FactoryRegistration(targetFactoryDouble, {
        token: 'targetTwo',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
  
      container.push(
        registrationOne,
        registrationTwo,
      )

      const targetOneCallResult = container.bundle.targetOne.call()
      const targetTwoCallResult = container.bundle.targetTwo.call()
  
      expect(targetOneCallResult).toBe('targetOne::call')
      expect(targetTwoCallResult).toBe('targetDouble::call')
  
      const targetOneCallDependencyResult = container.bundle.targetOne.callDependency()
  
      expect(targetOneCallDependencyResult).toBe('targetDouble::call')
    })
  
    it('Should resolve cyclic dependency graph when dependency properties are not accessed during instance initialization', () => {
      const container = new Injection.Container()
  
      const registrationOne = new Injection.FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
  
      const registrationTwo = new Injection.FactoryRegistration(targetFactoryTwo, {
        token: 'targetTwo',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
  
      container.push(
        registrationOne,
        registrationTwo,
      )
  
      const targetOneCallResult = container.bundle.targetOne.call()
      const targetTwoCallResult = container.bundle.targetTwo.call()
  
      expect(targetOneCallResult).toBe('targetOne::call')
      expect(targetTwoCallResult).toBe('targetTwo::call')
  
      const targetOneCallDependencyResult = container.bundle.targetOne.callDependency()
      const targetTwoCallDependencyResult = container.bundle.targetTwo.callDependency()
      
      expect(targetOneCallDependencyResult).toBe('targetTwo::call')
      expect(targetTwoCallDependencyResult).toBe('targetOne::call')
    })
  
    it('Should resolve cyclic dependency graph when dependency properties are accessed in single direction', () => {
      const container = new Injection.Container()
  
      const registrationOne = new Injection.FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
  
      const registrationTwo = new Injection.FactoryRegistration((dependencies) => {
        const targetOneCallResultDuringResolution = dependencies.targetOne.call()
        expect(targetOneCallResultDuringResolution).toBe('targetOne::call')
        return targetFactoryTwo(dependencies)
      }, {
        token: 'targetTwo',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
  
      container.push(
        registrationOne,
        registrationTwo,
      )
  
      const targetOneCallResult = container.bundle.targetOne.call()
      const targetTwoCallResult = container.bundle.targetTwo.call()
  
      expect(targetOneCallResult).toBe('targetOne::call')
      expect(targetTwoCallResult).toBe('targetTwo::call')
  
      const targetOneCallDependencyResult = container.bundle.targetOne.callDependency()
      const targetTwoCallDependencyResult = container.bundle.targetTwo.callDependency()
      
      expect(targetOneCallDependencyResult).toBe('targetTwo::call')
      expect(targetTwoCallDependencyResult).toBe('targetOne::call')
    })
  
    it('Should lazily resolve dependency targets only when dependency properties are accessed', () => {
      const container = new Injection.Container()

      const registrationOne = new Injection.FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
      
      const registrationTwo = new Injection.FactoryRegistration(targetFactoryTwo, {
        token: 'targetTwo',
        bundle: container.bundle,
        resolver: defaultResolver,
      })
  
      container.push(
        registrationOne,
        registrationTwo,
      )
  
      expect(defaultResolverWasCalled).toBe(false)
      expect(targetFactoryOneWasCalled).toBe(false)
      expect(targetFactoryTwoWasCalled).toBe(false)
  
      container.bundle.targetOne
      container.bundle.targetOne
  
      expect(defaultResolverWasCalled).toBe(false)
      expect(targetFactoryOneWasCalled).toBe(false)
      expect(targetFactoryTwoWasCalled).toBe(false)
  
      container.bundle.targetOne.call
      expect(defaultResolverWasCalled).toBe(true)
      expect(targetFactoryOneWasCalled).toBe(true)
      expect(targetFactoryTwoWasCalled).toBe(false)
      
      container.bundle.targetTwo.call
      expect(defaultResolverWasCalled).toBe(true)
      expect(targetFactoryOneWasCalled).toBe(true)
      expect(targetFactoryTwoWasCalled).toBe(true)
    })
  })

  describe('bundle', () => {
    it('Should throw error on attempt to set dependency through bundle object', () => {
      const container = new Injection.Container()

      expect(() => container.bundle['dependencyToken'] = 'value').toThrow(
        `Could not set registration "dependencyToken". Registration should not be done through bundle.`
      )
    })
    
    it('Should throw error on attempt to access invalid registration token', () => {
      const container = new Injection.Container()

      expect(() => container.bundle['key']).toThrow(
        `Could not resolve dependency "key". Invalid registration token.`
      )
    })
    
    it('Should throw error on attempt to set properties through registration bundle values', () => {
      const container = new Injection.Container()

      const registration = new Injection.FactoryRegistration(targetFactoryOne, { 
        token: 'dependencyToken'
      })

      container.push(registration)

      expect(() => container.bundle['dependencyToken']['propertyKey'] = 'value').toThrow(
        `Could not set dependency property "propertyKey". Dependency properties cannot be set through registration bundle.`
      )
    })

    it('Should allows bundle to be merged using object destructuring', () => {
      const someFactory = () => {
        return { property: 'someResolvedDependency' }
      }

      const someRegistration = new Injection.FactoryRegistration(someFactory, { 
        token: 'someDependency'
      })


      const anotherFactory = () => {
        return { property: 'anotherResolvedDependency' }
      }

      const anotherRegistration = new Injection.FactoryRegistration(anotherFactory, { 
        token: 'anotherDependency'
      })

      const someContainer = new Injection.Container()

      someContainer.push(
        someRegistration,
      )

      const anotherContainer = new Injection.Container()

      anotherContainer.push(
        anotherRegistration,
      )

      const mergedBundle = {
        ...someContainer.bundle,
        ...anotherContainer.bundle,
      }

      expect(mergedBundle.someDependency.property).toBe('someResolvedDependency')

      expect(mergedBundle.anotherDependency.property).toBe('anotherResolvedDependency')
    })

    it('Should return target tokens as bundle keys', () => {
      const container = new Injection.Container()
  
      const registrationOne = new Injection.FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
      })
  
      const registrationTwo = new Injection.FactoryRegistration(targetFactoryDouble, {
        token: 'targetTwo',
        bundle: container.bundle,
      })
  
      container.push(
        registrationOne,
        registrationTwo,
      )

      const keys = Object.keys(container.bundle)

      expect(keys.length).toBe(2)
      expect(keys.includes('targetOne')).toBe(true)
      expect(keys.includes('targetTwo')).toBe(true)
    })
  })
})