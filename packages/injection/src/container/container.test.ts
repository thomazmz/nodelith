import { Constructor, Function } from '@nodelith/types'

import { Registration } from '../registration'
import { Container } from './container'
import { Bundle } from '../bundle'

describe('Container', () => {
  function createStaticRegistration(token: string, resolution?: any): Registration {
    return {
      token,
      clone: () => createStaticRegistration(token, resolution),
      resolve: () => resolution,
    }
  }

  function createFunctionRegistration(token: string, target?: Function): Registration {
    return {
      token,
      clone: () => createFunctionRegistration(token, target),
      resolve: target ? (bundle?: Bundle) => target(bundle) : () => 'resolution',
    }
  }

  function createConstructor(token: string, target?: Constructor): Registration {
    return {
      token,
      clone: () => createConstructor(token, target),
      resolve: target ? (bundle?: Bundle) => new target(bundle) : () => 'resolution',
    }
  }

  describe('has', () => {
    it('should return "true" when token is already used', () => {
      const container = new Container()
      const stubRegistration_0 = createFunctionRegistration('stubRegistration')

      container.push(stubRegistration_0)
      expect(container.has('stubRegistration')).toBe(true)
    })

    it('should return "false" when token is already used', () => {
      const container = new Container()
      expect(container.has('stubRegistration')).toBe(false)
    })
  })

  describe('register', () => {
    it('should register registrations as part of the container', () => {
      const container = new Container()
      const stubRegistration_0 = createFunctionRegistration('stubRegistration_0')
      const stubRegistration_1 = createFunctionRegistration('stubRegistration_1')

      container.register(stubRegistration_0)
      container.register(stubRegistration_1)

      expect(container.has('stubRegistration_0')).toBe(true)
      expect(container.has('stubRegistration_1')).toBe(true)

      expect(container.get('stubRegistration_0')?.token).toBe(stubRegistration_0?.token)
      expect(container.get('stubRegistration_1')?.token).toBe(stubRegistration_1?.token)
    })

    it('should override registration token', () => {
      const container = new Container()

      const stubRegistration_0 = createFunctionRegistration('stubToken', () => 'resolution_0' )
      const stubRegistration_1 = createFunctionRegistration('stubToken', () => 'resolution_1' )
      
      container.register(stubRegistration_0)

      expect(container.has('stubToken')).toBe(true)
      expect(container.get('stubToken')?.token).toBe('stubToken')
      expect(container.get('stubToken')?.resolve()).toBe('resolution_0')

      container.register(stubRegistration_1)

      expect(container.has('stubToken')).toBe(true)
      expect(container.get('stubToken')?.token).toBe('stubToken')
      expect(container.get('stubToken')?.resolve()).toBe('resolution_1')
    })

    it('should throw error when cloning the registration results a different token', () => {
      const container = new Container()
      const registration = { ...createStaticRegistration('someToken', 'staticValue'), clone() {
        return createStaticRegistration('anotherToken', 'staticValue')
      }}

      expect(() => {
        container.register(registration)
      }).toThrow('Could not register "someToken". Registration clone has a different token "anotherToken".')
    })
  })

  describe('push', () => {
    it('should push registrations as part of the container', () => {
      const container = new Container()
      const stubRegistration_0 = createFunctionRegistration('stubRegistration_0')
      const stubRegistration_1 = createFunctionRegistration('stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      expect(container.has('stubRegistration_0')).toBe(true)
      expect(container.has('stubRegistration_1')).toBe(true)

      expect(container.get('stubRegistration_0')?.token).toBe(stubRegistration_0?.token)
      expect(container.get('stubRegistration_1')?.token).toBe(stubRegistration_1?.token)
    })

    it('should override registration token', () => {
      const container = new Container()

      const stubRegistration_0 = createFunctionRegistration('stubToken', () => 'resolution_0' )
      const stubRegistration_1 = createFunctionRegistration('stubToken', () => 'resolution_1' )
      
      container.push(stubRegistration_0)

      expect(container.has('stubToken')).toBe(true)
      expect(container.get('stubToken')?.token).toBe('stubToken')
      expect(container.get('stubToken')?.resolve()).toBe('resolution_0')

      container.push(stubRegistration_1)

      expect(container.has('stubToken')).toBe(true)
      expect(container.get('stubToken')?.token).toBe('stubToken')
      expect(container.get('stubToken')?.resolve()).toBe('resolution_1')
    })

    it('should throw error when cloning the registration results a different token', () => {
      const container = new Container()
      const registration = { ...createStaticRegistration('someToken', 'staticValue'), clone() {
        return createStaticRegistration('anotherToken', 'staticValue')
      }}

      expect(() => {
        container.push(registration)
      }).toThrow('Could not register "someToken". Registration clone has a different token "anotherToken".')
    })
  })

  describe('get', () => {
    it('should return undefined when getting unregistered token', () => {
      const container = new Container()
      const stubRegistration_0 = createFunctionRegistration('stubRegistration_0')
      const stubRegistration_1 = createFunctionRegistration('stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )
      
      const registration = container.get('stubRegistration_2')

      expect(registration).toBe(undefined)
    })

    it('should return registration based on token', () => {
      const container = new Container()
      const stubRegistration_0 = createFunctionRegistration('stubRegistration_0')
      const stubRegistration_1 = createFunctionRegistration('stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      const stubRegistrationClone_0 = container.get('stubRegistration_0')
      const stubRegistrationClone_1 = container.get('stubRegistration_1')
      
      expect(stubRegistration_0).not.toBe(stubRegistrationClone_0)
      expect(stubRegistration_1).not.toBe(stubRegistrationClone_1)
      
      expect(stubRegistration_0?.token).toEqual(stubRegistrationClone_0?.token)
      expect(stubRegistration_1?.token).toEqual(stubRegistrationClone_1?.token)
    })
  })

  describe('resolve', () => {
    it('should return resolved registration when an existent token is passed', () => {
      const container = new Container()
      const stubRegistration = createFunctionRegistration('stubRegistration', () => 'resolutionString')

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
      const container = new Container();

      expect(() => {
        container.bundle.anyRegistration = createFunctionRegistration('anyRegistration')
      }).toThrow('Could not set registration "anyRegistration". Registration should not be done through bundle.')

      expect(() => {
        container.bundle['anyRegistration'] = createFunctionRegistration('anyRegistration')
      }).toThrow('Could not set registration "anyRegistration". Registration should not be done through bundle.')
    })

    it('should return undefined when accessing nonexistent registration', () => {
      const container = new Container()
      expect(container.bundle.stubRegistration).toBe(undefined)
      expect(container.bundle['stubRegistration']).toBe(undefined)
    })

    it('should return resolved registration when accessing existent registration', () => {
      const container = new Container()
      const stubRegistration = createFunctionRegistration('stubRegistration', () => 'resolutionString')

      container.push(stubRegistration)
      expect(container.bundle.stubRegistration).toBe('resolutionString')
      expect(container.bundle['stubRegistration']).toBe('resolutionString')
    })

    it('should return registered keys when manipulating bundle', () => {
      const container = new Container()

      const stubRegistration_0 = createFunctionRegistration('stubRegistration_0')
      const stubRegistration_1 = createFunctionRegistration('stubRegistration_1')

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

      const stubRegistration_0 = createFunctionRegistration('stubRegistration_0', () => 'stubRegistration_0')
      const stubRegistration_1 = createFunctionRegistration('stubRegistration_1', () => 'stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[stubRegistration_0.token.toString()]?.configurable).toBe(true)
      expect(descriptors[stubRegistration_1.token.toString()]?.configurable).toBe(true)
    })

    it('should return enumerable property descriptors when manipulating bundle',() => {
      const container = new Container()

      const stubRegistration_0 = createFunctionRegistration('stubRegistration_0', () => 'stubRegistration_0')
      const stubRegistration_1 = createFunctionRegistration('stubRegistration_1', () => 'stubRegistration_1')

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[stubRegistration_0.token.toString()]?.enumerable).toBe(true)
      expect(descriptors[stubRegistration_1.token.toString()]?.enumerable).toBe(true)
    })

    it('should not include self references during resolution', () => {
      const container = new Container()

      container.register(createFunctionRegistration('target_0', (bundle: Bundle) => {
        expect(Object.keys(bundle)).toEqual(['target_1', 'target_2'])
        expect(bundle['target_0']).toBeUndefined()
      }))

      container.register(createFunctionRegistration('target_1', (bundle: Bundle) => {
        expect(Object.keys(bundle)).toEqual(['target_0', 'target_2'])
        expect(bundle['target_1']).toBeUndefined()
      }))

      container.register(createFunctionRegistration('target_2', (bundle: Bundle) => {
        expect(Object.keys(bundle)).toEqual(['target_0', 'target_1'])
        expect(bundle['target_2']).toBeUndefined()
      }))

      container.resolve('target_0')
      container.resolve('target_1')
      container.resolve('target_2')
    })

    it('should not include self references during cloning', () => {
      const container = new Container()

      const registration_0 = createFunctionRegistration('target_0')
      container.register({ ...registration_0, clone(bundle: Bundle = {}) {
        expect(Object.keys(bundle)).toEqual([])
        expect(bundle['target_0']).toBeUndefined()
        return registration_0.clone(bundle)
      }})

      const registration_1 = createFunctionRegistration('target_1')
      container.register({ ...registration_1, clone(bundle: Bundle = {}) {
        expect(Object.keys(bundle)).toEqual(['target_0'])
        expect(bundle['target_1']).toBeUndefined()
        return registration_1.clone(bundle)
      }})

      const registration_2 = createFunctionRegistration('target_2')
      container.register({ ...registration_2, clone(bundle: Bundle = {}) {
        expect(Object.keys(bundle)).toEqual(['target_0', 'target_1'])
        expect(bundle['target_2']).toBeUndefined()
        return registration_2.clone(bundle)
      }})
    })
  })

  describe('resolution',() => {
    it('should resolve acyclic dependency graph with target functions when not destructuring bundle', () => {
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
  
      container.push(
        createFunctionRegistration('target_0', targetFunction_0),
        createFunctionRegistration('target_1', targetFunction_1),
        createFunctionRegistration('target_2', targetFunction_2),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')
      expect(container.bundle.target_2.call()).toBe('called_target_2')

      expect(container.bundle.target_1.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_1()).toBe('called_target_1')
    })

    it('should resolve acyclic dependency graph with target constructors when not destructuring bundle', () => {
      const container = new Container()

      class TargetClass_0 {

        public call() {
          return 'called_target_0'
        }
      }

      class TargetClass_1 {
        public target_0: TargetClass_0

        constructor(dependencies: Bundle) {
          this.target_0 = dependencies.target_0
        }

        public call() {
          return 'called_target_1'
        }

        public callTarget_0() {
          return this.target_0.call()
        }
      }

      class TargetClass_2 {
        public target_0: TargetClass_0
        public target_1: TargetClass_1

        constructor(dependencies: Bundle) {
          this.target_0 = dependencies.target_0
          this.target_1 = dependencies.target_1
        }

        public call() {
          return 'called_target_2'
        }

        public callTarget_0() {
          return this.target_0.call()
        }

        public callTarget_1() {
          return this.target_1.call()
        }
      }
      
      container.push(
        createConstructor('target_0', TargetClass_0),
        createConstructor('target_1', TargetClass_1),
        createConstructor('target_2', TargetClass_2),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')
      expect(container.bundle.target_2.call()).toBe('called_target_2')

      expect(container.bundle.target_1.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_1()).toBe('called_target_1')
    })

    it('should resolve acyclic dependency graph with target functions when destructuring bundle', () => {
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
  
      container.push(
        createFunctionRegistration('target_0', targetFunction_0),
        createFunctionRegistration('target_1', targetFunction_1),
        createFunctionRegistration('target_2', targetFunction_2),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')
      expect(container.bundle.target_2.call()).toBe('called_target_2')

      expect(container.bundle.target_1.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_1()).toBe('called_target_1')
    })

    it('should resolve acyclic dependency graph with target constructors when destructuring bundle', () => {
      const container = new Container()

      class TargetClass_0 {

        public call() {
          return 'called_target_0'
        }
      }

      class TargetClass_1 {
        public target_0: TargetClass_0

        constructor({ target_0 }: Bundle) {
          this.target_0 = target_0
        }

        public call() {
          return 'called_target_1'
        }

        public callTarget_0() {
          return this.target_0.call()
        }
      }

      class TargetClass_2 {
        public target_0: TargetClass_0
        public target_1: TargetClass_1

        constructor({ target_0, target_1 }: Bundle) {
          this.target_0 = target_0
          this.target_1 = target_1
        }

        public call() {
          return 'called_target_2'
        }

        public callTarget_0() {
          return this.target_0.call()
        }

        public callTarget_1() {
          return this.target_1.call()
        }
      }
      
      container.push(
        createConstructor('target_0', TargetClass_0),
        createConstructor('target_1', TargetClass_1),
        createConstructor('target_2', TargetClass_2),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')
      expect(container.bundle.target_2.call()).toBe('called_target_2')

      expect(container.bundle.target_1.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_0()).toBe('called_target_0')
      expect(container.bundle.target_2.callTarget_1()).toBe('called_target_1')
    })

    it('should resolve cyclic dependency graph with target functions when not destructuring bundle', () => {
      const container = new Container()

      const targetFunction_0 = (dependencies: Bundle) => {
        return {
          call: () => 'called_target_0',
          callDependency: () => dependencies.target_1.call(),
        }
      }
    
      const targetFunction_1 = (dependencies: Bundle) => {
        return {
          call: () => 'called_target_1',
          callDependency: () => dependencies.target_0.call(),
        }
      }
  
      container.push(
        createFunctionRegistration('target_0', targetFunction_0),
        createFunctionRegistration('target_1', targetFunction_1),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')

      expect(container.bundle.target_0.callDependency()).toBe('called_target_1')
      expect(container.bundle.target_1.callDependency()).toBe('called_target_0')
    })

    it('should resolve cyclic dependency graph with target constructors when not destructuring bundle', () => {
      const container = new Container()

      class TargetClass_0 {
        public target_1: TargetClass_1

        constructor(dependencies: Bundle) {
          this.target_1 = dependencies.target_1
        }

        public call() {
          return 'called_target_0'
        }

        public callDependency() {
          return this.target_1.call()
        }
      }

      class TargetClass_1 {
        public target_0: TargetClass_0

        constructor(dependencies: Bundle) {
          this.target_0 = dependencies.target_0
        }

        public call() {
          return 'called_target_1'
        }

        public callDependency() {
          return this.target_0.call()
        }
      }

      container.push(
        createConstructor('target_0', TargetClass_0),
        createConstructor('target_1', TargetClass_1),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')

      expect(container.bundle.target_0.callDependency()).toBe('called_target_1')
      expect(container.bundle.target_1.callDependency()).toBe('called_target_0')    
    })

    it('should resolve cyclic dependency graph with target functions when destructuring bundle', () => {
      const container = new Container()

      const targetFunction_0 = ({ target_1 }: Bundle) => {
        return {
          call: () => 'called_target_0',
          callDependency: () => target_1.call(),
        }
      }

      const targetFunction_1 = ({ target_0 }: Bundle) => {
        return {
          call: () => 'called_target_1',
          callDependency: () => target_0.call(),
        }
      }

      container.push(
        createFunctionRegistration('target_0', targetFunction_0),
        createFunctionRegistration('target_1', targetFunction_1),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')

      expect(container.bundle.target_0.callDependency()).toBe('called_target_1')
      expect(container.bundle.target_1.callDependency()).toBe('called_target_0')
    })

    it('should resolve cyclic dependency graph with target constructors when destructuring bundle', () => {
      const container = new Container()

      class TargetClass_0 {
        public target_1: TargetClass_1

        constructor({ target_1 }: Bundle) {
          this.target_1 = target_1
        }

        public call() {
          return 'called_target_0'
        }

        public callDependency() {
          return this.target_1.call()
        }
      }

      class TargetClass_1 {
        public target_0: TargetClass_0

        constructor({ target_0 }: Bundle) {
          this.target_0 = target_0
        }

        public call() {
          return 'called_target_1'
        }

        public callDependency() {
          return this.target_0.call()
        }
      }

      container.push(
        createConstructor('target_0', TargetClass_0),
        createConstructor('target_1', TargetClass_1),
      )

      expect(container.bundle.target_0.call()).toBe('called_target_0')
      expect(container.bundle.target_1.call()).toBe('called_target_1')

      expect(container.bundle.target_0.callDependency()).toBe('called_target_1')
      expect(container.bundle.target_1.callDependency()).toBe('called_target_0')    
    })

    it('should resolve access to the bundle values within the function registration', () => {
      const container = new Container()

      function createInstanceRegistration(token: string, target: Function<any, [string, string]>): Registration {
        return {
          token,
          clone: () => createInstanceRegistration(token, target),
          resolve: (bundle?: Bundle) => target(bundle?.firstName, bundle?.lastName),
        }
      }

      container.push(
        createStaticRegistration('firstName', 'Thomaz'),
        createStaticRegistration('lastName', 'Zandonotto'),
        createInstanceRegistration('person', (firstName: string, lastName: string) => ({ firstName, lastName })),
      )

      expect(container.bundle.person.firstName).toEqual('Thomaz')
      expect(container.bundle.person.lastName).toEqual('Zandonotto')
    })

    it('should resolve access to the bundle values within the constructor registration', () => {
      const container = new Container()

      function createInstanceRegistration(token: string, target: Constructor<any, [string, string]>): Registration {
        return {
          token,
          clone: () => createInstanceRegistration(token, target),
          resolve: (bundle?: Bundle) => new target(bundle?.firstName, bundle?.lastName),
        }
      }

      container.push(
        createStaticRegistration('firstName', 'Thomaz'),
        createStaticRegistration('lastName', 'Zandonotto'),
        createInstanceRegistration('person', class { 
          constructor(
            public readonly firstName: string,
            public readonly lastName: string
          ) { }
        })
      )

      expect(container.bundle.person.firstName).toEqual('Thomaz')
      expect(container.bundle.person.lastName).toEqual('Zandonotto')
    })
  })
})
