import {
  Factory,
} from '@nodelith/types'

import { 
  Container
} from 'container'

import {
  FactoryRegistration
} from 'registration'

describe('Container', () => {

  let targetFactoryOneWasCalled = false
  let targetFactoryTwoWasCalled = false
  let targetFactoryDoubleWasCalled = false

  beforeEach(() => {
    targetFactoryOneWasCalled = false
    targetFactoryTwoWasCalled = false
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

  const targetFactoryDouble: Factory = () => {
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
    it('Should resolve acyclic dependency graph', () => {
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

      const targetOneCallResult = container.bundle.targetOne.call()
      const targetTwoCallResult = container.bundle.targetTwo.call()
  
      expect(targetOneCallResult).toBe('targetOne::call')
      expect(targetTwoCallResult).toBe('targetDouble::call')
  
      const targetOneCallDependencyResult = container.bundle.targetOne.callDependency()
  
      expect(targetOneCallDependencyResult).toBe('targetDouble::call')
    })
  
    it('Should resolve cyclic dependency graph when dependency properties are not accessed during instance initialization', () => {
      const container = new Container()
  
      const registrationOne = new FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
      })
  
      const registrationTwo = new FactoryRegistration(targetFactoryTwo, {
        token: 'targetTwo',
        bundle: container.bundle,
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
      const container = new Container()
  
      const registrationOne = new FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
      })
  
      const registrationTwo = new FactoryRegistration((dependencies) => {
        const targetOneCallResultDuringResolution = dependencies.targetOne.call()
        expect(targetOneCallResultDuringResolution).toBe('targetOne::call')
        return targetFactoryTwo(dependencies)
      }, {
        token: 'targetTwo',
        bundle: container.bundle,
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
      const container = new Container()

      const registrationOne = new FactoryRegistration(targetFactoryOne, {
        token: 'targetOne',
        bundle: container.bundle,
      })
      
      const registrationTwo = new FactoryRegistration(targetFactoryTwo, {
        token: 'targetTwo',
        bundle: container.bundle,
      })
  
      container.push(
        registrationOne,
        registrationTwo,
      )
  
      expect(targetFactoryOneWasCalled).toBe(false)
      expect(targetFactoryTwoWasCalled).toBe(false)
  
      container.bundle.targetOne
      container.bundle.targetOne
  
      expect(targetFactoryOneWasCalled).toBe(false)
      expect(targetFactoryTwoWasCalled).toBe(false)
  
      container.bundle.targetOne.call
      expect(targetFactoryOneWasCalled).toBe(true)
      expect(targetFactoryTwoWasCalled).toBe(false)
      
      container.bundle.targetTwo.call
      expect(targetFactoryOneWasCalled).toBe(true)
      expect(targetFactoryTwoWasCalled).toBe(true)
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