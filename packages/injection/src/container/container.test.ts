import { Constructor, Function } from '@nodelith/types'

import { Registration } from '../registration'
import { Container } from './container'
import { Bundle } from '../bundle'
import { Token } from 'token'
import { Access } from 'access'

describe('Container', () => {
  function createRegistration<R>(options: {
    token?: Token | undefined
    access?: Access | undefined
    bundle?: Bundle | undefined
    target?: ((bundle: Bundle) => R) | undefined
  }): Registration {
    const token = options.token ?? Symbol()
    const access = options.access ?? 'public'

    return {
      token,
      access,
      clone: (bundle?: Bundle) => {
        return createRegistration({ ...options, bundle })
      },
      resolve: (bundle?: Bundle) => {
        return options.target?.({ ...bundle, ...options.bundle }) ?? token
      },
    }
  }

  describe('has', () => {
    it('should return "true" when token is already used', () => {
      const container = new Container()

      const stub_registration_0 = createRegistration({
        token: 'stub_registration',
        target: () => undefined,
      })

      container.useRegistrations(stub_registration_0)
      expect(container.has('stub_registration')).toBe(true)
    })
    it('should return "false" when token is already used', () => {
      const container = new Container()
      expect(container.has('stub_registration')).toBe(false)
    })
  })

  describe('register', () => {
    it('should return registration', () => {
      const container = new Container()
      const container_registration_0 = createRegistration({ token: 'registration_0' })
      const container_registration_1 = createRegistration({ token: 'registration_1' })

      const scoped_registration_0 = container.useRegistration(container_registration_0)
      const scoped_registration_1 = container.useRegistration(container_registration_1)

      expect(scoped_registration_0.resolve()).toBe('registration_0')
      expect(scoped_registration_1.resolve()).toBe('registration_1')
    })
    it('should override registration token', () => {
      const container = new Container()
      const registration_0 = createRegistration({ token: 'token_0', target: () => 'resolution_0' })
      const registration_1 = createRegistration({ token: 'token_0', target: () => 'resolution_1' })
      
      container.useRegistration(registration_0)

      expect(container.has('token_0')).toBe(true)
      expect(container.resolve('token_0')).toBe('resolution_0')

      container.useRegistration(registration_1)

      expect(container.has('token_0')).toBe(true)
      expect(container.resolve('token_0')).toBe('resolution_1')
    })
    it('should return scoped registration', () => {
      const container = new Container()

      const registration_0 = createRegistration({ token: 'registration_0' })
      const registration_1 = createRegistration({ token: 'registration_1' })

      const scoped_registration_0 = container.useRegistration(registration_0)
      const scoped_registration_1 = container.useRegistration(registration_1)

      expect(scoped_registration_1).not.toBe(registration_1)
      expect(scoped_registration_0).not.toBe(registration_0)
    })
  })

  describe('push', () => {
    it('should return registration', () => {
      const container = new Container()
      const container_registration_0 = createRegistration({ token: 'registration_0' })
      const container_registration_1 = createRegistration({ token: 'registration_1' })

      const [
        scoped_registration_0,
        scoped_registration_1,
      ] = container.useRegistrations(
        container_registration_0,
        container_registration_1,
      )
      
      expect(scoped_registration_0?.resolve()).toBe('registration_0')
      expect(scoped_registration_1?.resolve()).toBe('registration_1')
    })
    it('should override registration token', () => {
      const container = new Container()
      const registration_0 = createRegistration({ token: 'token_0', target: () => 'resolution_0' })
      const registration_1 = createRegistration({ token: 'token_0', target: () => 'resolution_1' })
      
      container.useRegistrations(registration_0)

      expect(container.has('token_0')).toBe(true)
      expect(container.resolve('token_0')).toBe('resolution_0')

      container.useRegistrations(registration_1)

      expect(container.has('token_0')).toBe(true)
      expect(container.resolve('token_0')).toBe('resolution_1')
    })
    it('should return scoped registrations', () => {
      const container = new Container()

      const registration_0 = createRegistration({ token: 'stubRegistration_0' })
      const registration_1 = createRegistration({ token: 'stubRegistration_1' })

      const [
        scoped_registration_0,
        scoped_registration_1,
      ] = container.useRegistrations(
        registration_0,
        registration_1,
      )

      expect(scoped_registration_0,).not.toBe(registration_0)
      expect(scoped_registration_1).not.toBe(registration_1)

      expect(scoped_registration_0?.token).toBe(registration_0?.token)
      expect(scoped_registration_1?.token).toBe(registration_1?.token)
    })
  })

  describe('bundle', () => {
    xit('should throw error when trying to set bundle property', () => {
      const container = new Container();

      expect(() => {
        container.bundle.registration_0 = createRegistration({ token: 'registration_0' })
      }).toThrow('Could not set bundle key "registration_0". Targets are not allowed to assign bundle values.')

      expect(() => {
        container.bundle['registration_1'] = createRegistration({ token: 'registration_1' })
      }).toThrow('Could not set bundle key "registration_1". Targets are not allowed to assign bundle values.')
    })
    it('should return undefined when accessing nonexistent registration', () => {
      const container = new Container()
      expect(container.bundle.registration).toBe(undefined)
      expect(container.bundle['registration']).toBe(undefined)
    })
    it('should return resolved registration when accessing existent registration', () => {
      const container = new Container()
      const registration_0 = createRegistration({ token: 'registration_0' })

      container.useRegistrations(registration_0)
      expect(container.bundle.registration_0).toBe('registration_0')
      expect(container.bundle['registration_0']).toBe('registration_0')
    })
    it('should return registered keys when manipulating bundle', () => {
      const container = new Container()
      const registration_0 = createRegistration({ token: 'registration_0' })
      const registration_1 = createRegistration({ token: 'registration_1' })

      container.useRegistrations(registration_0, registration_1)

      expect(Object.keys(container.bundle)).toEqual(expect.arrayContaining([
        registration_0.token,
        registration_1.token,
      ]))
    })
    it('should return  enumerable property descriptors when manipulating bundle', () => {
      const container = new Container()
      const registration_0 = createRegistration({ token: 'registration_0' })
      const registration_1 = createRegistration({ token: 'registration_1' })

      container.useRegistrations(registration_0, registration_1)

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[registration_0.token.toString()]?.enumerable).toBe(true)
      expect(descriptors[registration_1.token.toString()]?.enumerable).toBe(true)
    })
    it('should return configurable property descriptors when manipulating bundle',() => {
      const container = new Container()
      const registration_0 = createRegistration({ token: 'registration_0' })
      const registration_1 = createRegistration({ token: 'registration_1' })

      container.useRegistrations(registration_0, registration_1)

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[registration_0.token.toString()]?.configurable).toBe(true)
      expect(descriptors[registration_1.token.toString()]?.configurable).toBe(true)
    })
  })

  describe('resolve', () => {
    it('should resolve registration value', () => {
      const container_0 = new Container()
      const registration_0 = createRegistration({ token: 'registration_0' })
      container_0.useRegistrations(registration_0)
      expect(container_0.resolve('registration_0')).toBe('registration_0')
    })
    it('should return undefined for unregistered token', () => {
      const container = new Container()
      expect(container.resolve('registration_0')).toBe(undefined)
    })
    it('should resolve acyclic dependency graph with target dependencies when not destructuring bundle', () => {
      const container = new Container()

      const targetFunction_0 = () => {
        return { 
          call: () => 'called_target_0' 
        }
      }
    
      const targetFunction_1 = (dependencies: Bundle) => {
        return { 
          call: () => 'called_target_1',
          callTarget_0: () => dependencies.target_0.call(),
        }
      }

      const targetFunction_2  = (dependencies: Bundle) => {
        return { 
          call: () => 'called_target_2',
          callTarget_0: () => dependencies.target_0.call(),
          callTarget_1: () => dependencies.target_1.call(),
        }
      }
  
      container.useRegistrations(
        createRegistration({ token: 'target_0', target: targetFunction_0 }),
        createRegistration({ token: 'target_1', target: targetFunction_1 }),
        createRegistration({ token: 'target_2', target: targetFunction_2 }),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')
      expect(container.bundle.target_2.call()).toBe('called_target_2')

      expect(container.bundle.target_1.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_1()).toBe('called_target_1')
    })
    it('should resolve acyclic dependency graph with target dependencies when destructuring bundle', () => {
      const container = new Container()

      const targetFunction_0 = () => {
        return { 
          call: () => 'called_target_0' 
        }
      }
    
      const targetFunction_1 = ({ target_0 }: Bundle) => {
        return { 
          call: () => 'called_target_1',
          callTarget_0: () => target_0.call(),
        }
      }

      const targetFunction_2  = ({ target_0, target_1 }: Bundle) => {
        return { 
          call: () => 'called_target_2',
          callTarget_0: () => target_0.call(),
          callTarget_1: () => target_1.call(),
        }
      }
  
      container.useRegistrations(
        createRegistration({ token: 'target_0', target: targetFunction_0 }),
        createRegistration({ token: 'target_1', target: targetFunction_1 }),
        createRegistration({ token: 'target_2', target: targetFunction_2 }),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')
      expect(container.bundle.target_2.call()).toBe('called_target_2')

      expect(container.bundle.target_1.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_1()).toBe('called_target_1')
    })
    it('should resolve cyclic dependency graph with target dependencies when not destructuring bundle', () => {
      const container = new Container()

      const targetFunction_0 = (bundle: Bundle) => ({
        call: () => 'called_target_0',
        callDependency: () => bundle.target_1.call(),
      })
    
      const targetFunction_1 = (bundle: Bundle) => ({
        call: () => 'called_target_1',
        callDependency: () => bundle.target_0.call(),
      })

      container.useRegistration(createRegistration({ token: 'target_0', target: targetFunction_0 }))
      container.useRegistration(createRegistration({ token: 'target_1', target: targetFunction_1 }))
  
      container.useRegistrations(
        createRegistration({ token: 'target_0', target: targetFunction_0 }),
        createRegistration({ token: 'target_1', target: targetFunction_1 }),
      )

      expect(container.resolve('target_0').call()).toBe('called_target_0')
      expect(container.resolve('target_1').call()).toBe('called_target_1')

      expect(container.resolve('target_0').callDependency()).toBe('called_target_1')
      expect(container.resolve('target_1').callDependency()).toBe('called_target_0')

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')

      expect(container.bundle.target_0.callDependency()).toBe('called_target_1')
      expect(container.bundle.target_1.callDependency()).toBe('called_target_0')
    })
    it('should resolve cyclic dependency graph with target dependencies when destructuring bundle', () => {
      const container = new Container()

      const targetFunction_0 = ({ target_1 }: Bundle) => ({
        call: () => 'called_target_0',
        callDependency: () => target_1.call(),
      })

      const targetFunction_1 = ({ target_0 }: Bundle) => ({
        call: () => 'called_target_1',
        callDependency: () => target_0.call(),
      })

      container.useRegistrations(
        createRegistration({ token: 'target_0', target: targetFunction_0 }),
        createRegistration({ token: 'target_1', target: targetFunction_1 }),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')

      expect(container.bundle.target_0.callDependency()).toBe('called_target_1')
      expect(container.bundle.target_1.callDependency()).toBe('called_target_0')
    })
    it('should resolve cyclic dependency graph when objects are accessed during resolution', () => {
      const container = new Container()

      const targetFunction_0 = ({ target_1 }: Bundle) => ({
        value: 'target_0',
        target_1: target_1.value,
      })

      const targetFunction_1 = ({ target_0 }: Bundle) => ({
        value: 'target_1',
        target_0: target_0.value,
      })

      container.useRegistrations(
        createRegistration({ token: 'target_0', target: targetFunction_0 }),
        createRegistration({ token: 'target_1', target: targetFunction_1 }),
      )

      expect(container.bundle.target_0.value).toBe('target_0')
      expect(container.bundle.target_0.target_1).toBe('target_1')

      expect(container.bundle.target_1.value).toBe('target_1')
      expect(container.bundle.target_1.target_0).toBe('target_0')
    })
  })

  describe('clone', () => {
    it('should include bundle', () => {
      const container = new Container({ bundle: { registration_0: 'registration_0' }})

      container.useRegistration(createRegistration({ token: 'registration_1' }))

      const clone = container.clone({ registration_2: 'registration_2' })

      expect(container).not.toBe(clone)
      expect(clone.bundle.registration_0).toEqual('registration_0')
      expect(clone.bundle.registration_1).toEqual('registration_1')
      expect(clone.bundle.registration_2).toEqual('registration_2')
    })
  })
})
