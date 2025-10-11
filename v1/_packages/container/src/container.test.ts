import {
  Factory,
} from '@nodelith/types'

import { 
  Container
} from './container'

import {
  FactoryRegistration
} from './registration'

describe('Container', () => {

  let targetFactoryOneWasCalled = false
  let targetFactoryOneWithSpreadWasCalled = false
  let targetFactoryTwoWasCalled = false
  let targetFactoryTwoWithSpreadWasCalled = false
  let targetFactoryDoubleWasCalled = false

  beforeEach(() => {
    targetFactoryOneWasCalled = false
    targetFactoryOneWithSpreadWasCalled = false
    targetFactoryTwoWasCalled = false
    targetFactoryTwoWithSpreadWasCalled = false
    targetFactoryDoubleWasCalled = false
  })

  const targetFactoryOne: Factory = ({ targetTwo }) => {
    const call = () => 'targetOne::call'
    const callDependency = () => targetTwo.call()
    targetFactoryOneWasCalled = true
    return { call, callDependency }
  }

  const targetFactoryTwo: Factory = ({ targetOne }) => {
    const call = () => 'targetTwo::call'
    const callDependency = () => targetOne.call()
    targetFactoryTwoWasCalled = true
    return { call, callDependency }
  }

  const targetFactoryOneWithSpread: Injection.Target = (targetTwo) => {
    const call = () => 'targetOne::call'
    const callDependency = () => targetTwo.call()
    targetFactoryOneWithSpreadWasCalled = true
    return { call, callDependency }
  }

  const targetFactoryTwoWithSpread: Injection.Target = (targetOne) => {
    const call = () => 'targetTwo::call'
    const callDependency = () => targetOne.call()
    targetFactoryTwoWithSpreadWasCalled = true
    return { call, callDependency }
  }

  const targetFactoryDouble: Injection.Target = () => {
    const call = () => 'targetDouble::call'
    targetFactoryDoubleWasCalled = true
    return { call }
  }

  describe('registration', () => {
    const container = new Container()
  
    const registrationOne = new FactoryRegistration(targetFactoryOne, {
      token: 'targetOne',
      bundle: container.bundle,
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
  })

  describe('resolution', () => {
    describe('Bundle injection mode', () => {
      it('Should resolve acyclic dependency graph', () => {
        const container = new Injection.Container()
    
        const registrationOne = new Injection.FactoryRegistration(targetFactoryOne, {
          token: 'targetOne',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'bundle'
        })
    
        const registrationTwo = new Injection.FactoryRegistration(targetFactoryDouble, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'bundle'
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
          mode: 'bundle'
        })
    
        const registrationTwo = new Injection.FactoryRegistration(targetFactoryTwo, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'bundle'
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
          mode: 'bundle'
        })
    
        const registrationTwo = new Injection.FactoryRegistration((dependencies) => {
          const targetOneCallResultDuringResolution = dependencies.targetOne.call()
          expect(targetOneCallResultDuringResolution).toBe('targetOne::call')
          return targetFactoryTwo(dependencies)
        }, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'bundle'
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
          mode: 'bundle'
        })
        
        const registrationTwo = new Injection.FactoryRegistration(targetFactoryTwo, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'bundle'
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

    describe('Spread injection mode', () => {
      it('Should resolve acyclic dependency graph', () => {
        const container = new Injection.Container()
    
        const registrationOne = new Injection.FactoryRegistration(targetFactoryOneWithSpread, {
          token: 'targetOne',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
        })
    
        const registrationTwo = new Injection.FactoryRegistration(targetFactoryDouble, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
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
    
        const registrationOne = new Injection.FactoryRegistration(targetFactoryOneWithSpread, {
          token: 'targetOne',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
        })
    
        const registrationTwo = new Injection.FactoryRegistration(targetFactoryTwoWithSpread, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
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
    
        const registrationOne = new Injection.FactoryRegistration(targetFactoryOneWithSpread, {
          token: 'targetOne',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
        })
    
        const registrationTwo = new Injection.FactoryRegistration((targetOne) => {
          const targetOneCallResultDuringResolution = targetOne.call()
          expect(targetOneCallResultDuringResolution).toBe('targetOne::call')
          return targetFactoryTwoWithSpread(targetOne)
        }, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
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
  
        const registrationOne = new Injection.FactoryRegistration(targetFactoryOneWithSpread, {
          token: 'targetOne',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
        })
        
        const registrationTwo = new Injection.FactoryRegistration(targetFactoryTwoWithSpread, {
          token: 'targetTwo',
          bundle: container.bundle,
          resolver: defaultResolver,
          mode: 'spread'
        })
    
        container.push(
          registrationOne,
          registrationTwo,
        )
    
        expect(defaultResolverWasCalled).toBe(false)
        expect(targetFactoryOneWithSpreadWasCalled).toBe(false)
        expect(targetFactoryTwoWithSpreadWasCalled).toBe(false)
    
        container.bundle.targetOne
    
        expect(defaultResolverWasCalled).toBe(false)
        expect(targetFactoryOneWithSpreadWasCalled).toBe(false)
        expect(targetFactoryTwoWithSpreadWasCalled).toBe(false)
    
        container.bundle.targetOne.call
        expect(defaultResolverWasCalled).toBe(true)
        expect(targetFactoryOneWithSpreadWasCalled).toBe(true)
        expect(targetFactoryTwoWithSpreadWasCalled).toBe(false)
        
        container.bundle.targetTwo.call
        expect(defaultResolverWasCalled).toBe(true)
        expect(targetFactoryOneWithSpreadWasCalled).toBe(true)
        expect(targetFactoryTwoWithSpreadWasCalled).toBe(true)
      })
    })
  })

  describe('bundle', () => {
    it('Should throw error on attempt to set dependency through bundle object', () => {
      const container = new Container()

      expect(() => container.bundle['dependencyToken'] = 'value').toThrow(
        `Could not set registration "dependencyToken". Registration should not be done through bundle.`
      )
    })
    
    it('Should throw error on attempt to access invalid registration token', () => {
      const container = new Container()

      expect(() => container.bundle['key']).toThrow(
        `Could not resolve dependency "key". Invalid registration token.`
      )
    })

    it('Should allows bundle to be merged using object destructuring', () => {
      const someFactory = () => {
                return { property: 'someResolvedDependency' }
      }

      const someRegistration = new FactoryRegistration(someFactory, { 
        token: 'someDependency'
      })


      const anotherFactory = () => {
                return { property: 'anotherResolvedDependency' }
      }

      const anotherRegistration = new FactoryRegistration(anotherFactory, { 
        token: 'anotherDependency'
      })

      const someContainer = new Container()

      someContainer.push(
        someRegistration,
      )

      const anotherContainer = new Container()

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
      const container = new Container()
  
      const registrationOne = new FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
      })
  
      const registrationTwo = new FactoryRegistration(targetFactoryDouble, {
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