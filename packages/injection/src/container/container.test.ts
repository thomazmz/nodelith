import { Function } from '@nodelith/types'

import { Registration } from '../registration'
import { Container } from './container'
import { Bundle } from '../bundle'

describe('Container', () => {
  function createRegistration(token: string, target?: Function<any, [Bundle]>): Registration {
    return {
      token,
      clone: () => createRegistration(token, target),
      resolve: target ? (bundle: Bundle) => target(bundle) : () => 'resolution',
    }
  }

  describe('has', () => {
    it('should return "true" when token is already used', () => {
      const container = new Container()
      const stubRegistration_0 = createRegistration('stubRegistration')

      container.push(stubRegistration_0)
      expect(container.has('stubRegistration')).toBe(true)
    })

    it('should return "false" when token is already used', () => {
      const container = new Container()
      expect(container.has('stubRegistration')).toBe(false)
    })
  })

  describe('push', () => {
    it('should push registrations as part of the container', () => {
      const container = new Container()
      const stubRegistration_0 = createRegistration('stubRegistration_0')
      const stubRegistration_1 = createRegistration('stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      expect(container.has('stubRegistration_0')).toBe(true)
      expect(container.has('stubRegistration_1')).toBe(true)

      expect(container.unpack('stubRegistration_0')?.token).toBe(stubRegistration_0?.token)
      expect(container.unpack('stubRegistration_1')?.token).toBe(stubRegistration_1?.token)
    })

    it('should override registration token', () => {
      const container = new Container()

      const stubRegistration_0 = createRegistration('stubToken', () => 'resolution_0' )
      const stubRegistration_1 = createRegistration('stubToken', () => 'resolution_1' )
      
      container.push(stubRegistration_0)

      expect(container.has('stubToken')).toBe(true)
      expect(container.unpack('stubToken')?.token).toBe('stubToken')
      expect(container.unpack('stubToken')?.resolve()).toBe('resolution_0')

      container.push(stubRegistration_1)

      expect(container.has('stubToken')).toBe(true)
      expect(container.unpack('stubToken')?.token).toBe('stubToken')
      expect(container.unpack('stubToken')?.resolve()).toBe('resolution_1')
    })
  })

  describe('unpack', () => {
    it('should return undefined when unpacking unregistered token', () => {
      const container = new Container()
      const stubRegistration_0 = createRegistration('stubRegistration_0')
      const stubRegistration_1 = createRegistration('stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )
      
      const undefinedClone = container.unpack('stubRegistration_2')

      expect(undefinedClone).toBe(undefined)
    })

    it('should return registration clone based on token', () => {
      const container = new Container()
      const stubRegistration_0 = createRegistration('stubRegistration_0')
      const stubRegistration_1 = createRegistration('stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )
      
      const stubRegistrationClone_0 = container.unpack('stubRegistration_0')
      const stubRegistrationClone_1 = container.unpack('stubRegistration_1')

      expect(stubRegistration_0).not.toBe(stubRegistrationClone_0)
      expect(stubRegistration_1).not.toBe(stubRegistrationClone_1)

      expect(stubRegistration_0?.token).toEqual(stubRegistrationClone_0?.token)
      expect(stubRegistration_1?.token).toEqual(stubRegistrationClone_1?.token)
    })

    it('should return registration clones for all registrations', () => {
      const container = new Container()
      const stubRegistration_0 = createRegistration('stubRegistration_0', () => 'resolution_0')
      const stubRegistration_1 = createRegistration('stubRegistration_1', () => 'resolution_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      const registrationClones = container.unpack()

      expect([
        { token: stubRegistration_0.token, resolution: stubRegistration_0.resolve() },
        { token: stubRegistration_1.token, resolution: stubRegistration_1.resolve() },
      ]).toEqual(expect.arrayContaining([
        { token: registrationClones[0]?.token, resolution: registrationClones[0]?.resolve() },
        { token: registrationClones[1]?.token, resolution: registrationClones[1]?.resolve() },
      ]))
    })
  })

  describe('resolve', () => {
    it('should return resolved registration when an existent token is passed', () => {
      const container = new Container()
      const stubRegistration = createRegistration('stubRegistration', () => 'resolutionString')

      container.push(stubRegistration)
      expect(container.resolve('stubRegistration')).toBe('resolutionString')
    })

    it('should return undefined when an nonexistent token is passed', () => {
      const container = new Container()
      expect(container.resolve('stubRegistration')).toBe(undefined)
    })
  })

  describe('bundle', () => {
    it('should throw error when trying to set bundle property', () => {
      const container = new Container() as any

      expect(() => {
        container.bundle.anyRegistration = createRegistration('anyRegistration')
      }).toThrow('Could not set registration "anyRegistration". Registration should not be done through bundle.')

      expect(() => {
        container.bundle['anyRegistration'] = createRegistration('anyRegistration')
      }).toThrow('Could not set registration "anyRegistration". Registration should not be done through bundle.')
    })

    it('should return undefined when accessing nonexistent registration', () => {
      const container = new Container()
      expect(container.bundle.stubRegistration).toBe(undefined)
      expect(container.bundle['stubRegistration']).toBe(undefined)
    })

    it('should return resolved registration when accessing existent registration', () => {
      const container = new Container()
      const stubRegistration = createRegistration('stubRegistration', () => 'resolutionString')

      container.push(stubRegistration)
      expect(container.bundle.stubRegistration).toBe('resolutionString')
      expect(container.bundle['stubRegistration']).toBe('resolutionString')
    })

    it('should return registered keys when manipulating bundle', () => {
      const container = new Container()

      const stubRegistration_0 = createRegistration('stubRegistration_0')
      const stubRegistration_1 = createRegistration('stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      expect(Object.keys(container.bundle)).toEqual(expect.arrayContaining([
        stubRegistration_0.token,
        stubRegistration_1.token,
      ]))
    })

    it('should return configurable property descriptors when manipulating bundle',() => {
      const container = new Container()

      const stubRegistration_0 = createRegistration('stubRegistration_0', () => 'stubRegistration_0')
      const stubRegistration_1 = createRegistration('stubRegistration_1', () => 'stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[stubRegistration_0.token]?.configurable).toBe(true)
      expect(descriptors[stubRegistration_1.token]?.configurable).toBe(true)
    })

    it('should return enumerable property descriptors when manipulating bundle',() => {
      const container = new Container()

      const stubRegistration_0 = createRegistration('stubRegistration_0', () => 'stubRegistration_0')
      const stubRegistration_1 = createRegistration('stubRegistration_1', () => 'stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[stubRegistration_0.token]?.enumerable).toBe(true)
      expect(descriptors[stubRegistration_1.token]?.enumerable).toBe(true)
    })
  })

  describe('resolution',() => {
    it('should resolve cyclic dependency graph', () => {
      const container = new Container()

      const targetFactory_0 = (dependencies: Bundle) => {
        return {
          call: () => 'called_target_0',
          callDependency: () => dependencies.target_1.call(),
        }
      }
    
      const targetFactory_1 = (dependencies: Bundle) => {
        return {
          call: () => 'called_target_1',
          callDependency: () => dependencies.target_0.call(),
        }
      }
  
      container.push(
        createRegistration('target_0', targetFactory_0),
        createRegistration('target_1', targetFactory_1),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')

      expect(container.bundle.target_0.callDependency()).toBe('called_target_1')
      expect(container.bundle.target_1.callDependency()).toBe('called_target_0')
    })

    it('should resolve acyclic dependency graph', () => {
      const container = new Container()

      const targetFactory_0 = () => {
        return { 
          call: () => 'called_target_0' 
        }
      }
    
      const targetFactory_1 = () => {
        return { 
          call: () => 'called_target_1' 
        }
      }

      const targetFactory_2  = (dependencies: Bundle) => {
        return { 
          call: () => 'called_target_2',
          callTarget_0: () => dependencies.target_0.call(),
          callTarget_1: () => dependencies.target_1.call(),
        }
      }
  
      container.push(
        createRegistration('target_0', targetFactory_0),
        createRegistration('target_1', targetFactory_1),
        createRegistration('target_2', targetFactory_2),
      )

      expect(container.bundle.target_2.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_1()).toBe('called_target_1')

      expect(container.bundle.target_2.call()).toBe('called_target_2')
      expect(container.bundle.target_1.call()).toBe('called_target_1')
      expect(container.bundle.target_0.call()).toBe('called_target_0')
    })
  })
})