import * as Types from '@nodelith/types'

import { Token } from '../token';
import { Bundle } from '../bundle';
import { Access } from '../access';
import { Lifetime } from '../lifetime';
import { Registration } from '../registration'

import { Container } from './container'

export type FactoryRegistrationOptions<R extends object> = {
  target: Types.Factory<R>
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

describe('Container', () => {
  type TestRegistrationOptions =  {
    token?: Token
    bundle?: Bundle
    target?: Types.Function
  }

  class TestRegistration implements Registration {
    public static create(options: TestRegistrationOptions) {
      return new TestRegistration(options)
    }

    public readonly access = 'public'
    
    public readonly token: Token

    public readonly bundle:  Bundle

    public readonly target: Types.Function

    public constructor(options?: TestRegistrationOptions) {
      this.token = options?.token ?? Symbol()
      this.target = options?.target ?? (() => this.token)
      this.bundle =  options?.bundle ?? {}
    }

    public clone(bundle?: Bundle): Registration {
      return TestRegistration.create({
        token: this.token,
        target: this.target,
        bundle: bundle ?? {},
      })
    }

    public resolve() {
      return this.target(this.bundle)
    }
  }

  describe('has', () => {
    it('should return "true" when token is registered', () => {
      const container = new Container()

      container.register(TestRegistration.create({ token: 'target0', target: () => ({}) }))
      container.register(TestRegistration.create({ token: 'target1', target: () => ({}) }))

      expect(container.has('target0')).toBe(true)
      expect(container.has('target1')).toBe(true)
    })

    it('should return "false" when token is not registered', () => {
      const container = new Container()
      expect(container.has('target')).toBe(false)
    })
  })
  
  describe('resolve', () => {
    it('should resolve simple registration', () => {
      const container = new Container()

      const scopedRegistration0 = container.register(
        TestRegistration.create({ token: 'target0' }),
      )

      expect(scopedRegistration0.resolve()).toBe('target0')
    })
    it('should return undefined for unregistered token', () => {
      const container = new Container()
      expect(container.resolve('registration')).toBe(undefined)
    })
    it('should resolve acyclic dependency graph with target dependencies when not destructuring bundle', () => {
      const container = new Container()

      const target0 = () => {
        return {
          call: () => 'calledTarget0'
        }
      }
    
      const target1 = (dependencies: Bundle) => {
        return { 
          call: () => 'calledTarget1',
          callTarget0: () => dependencies.target0.call(),
        }
      }

      const target2  = (dependencies: Bundle) => {
        return { 
          call: () => 'calledTarget2',
          callTarget0: () => dependencies.target0.call(),
          callTarget1: () => dependencies.target1.call(),
        }
      }

      container.register(TestRegistration.create({ token: 'target0', target: target0 }))
      container.register(TestRegistration.create({ token: 'target1', target: target1 }))
      container.register(TestRegistration.create({ token: 'target2', target: target2 }))

      expect(container.bundle.target0.call()).toBe('calledTarget0')
      expect(container.bundle.target1.call()).toBe('calledTarget1')
      expect(container.bundle.target2.call()).toBe('calledTarget2')

      expect(container.bundle.target1.callTarget0()).toBe('calledTarget0')
      expect(container.bundle.target2.callTarget0()).toBe('calledTarget0')
      expect(container.bundle.target2.callTarget1()).toBe('calledTarget1')
    })
    it('should resolve acyclic dependency graph with target dependencies when destructuring bundle', () => {
      const container = new Container()

      const target0 = () => {
        return {
          call: () => 'calledTarget0'
        }
      }
    
      const target1 = ({ target0 }: Bundle) => {
        return { 
          call: () => 'calledTarget1',
          callTarget0: () => target0.call(),
        }
      }

      const target2  = ({ target0, target1 }: Bundle) => {
        return { 
          call: () => 'calledTarget2',
          callTarget0: () => target0.call(),
          callTarget1: () => target1.call(),
        }
      }
  
      
      container.register(TestRegistration.create({ token: 'target0', target: target0 })),
      container.register(TestRegistration.create({ token: 'target1', target: target1 })),
      container.register(TestRegistration.create({ token: 'target2', target: target2 })),
      

      expect(container.bundle.target0.call()).toBe('calledTarget0')
      expect(container.bundle.target1.call()).toBe('calledTarget1')
      expect(container.bundle.target2.call()).toBe('calledTarget2')

      expect(container.bundle.target1.callTarget0()).toBe('calledTarget0')
      expect(container.bundle.target2.callTarget0()).toBe('calledTarget0')
      expect(container.bundle.target2.callTarget1()).toBe('calledTarget1')
    })
    it('should resolve cyclic dependency graph with target dependencies when not destructuring bundle', () => {
      const container = new Container()

      const target0 = (bundle: Bundle) => ({
        call: () => 'calledTarget0',
        callDependency: () => bundle.target1.call(),
      })
    
      const target1 = (bundle: Bundle) => ({
        call: () => 'calledTarget1',
        callDependency: () => bundle.target0.call(),
      })

      container.register(TestRegistration.create({ token: 'target0', target: target0 }))
      container.register(TestRegistration.create({ token: 'target1', target: target1 }))

      expect(container.resolve('target0').call()).toBe('calledTarget0')
      expect(container.resolve('target1').call()).toBe('calledTarget1')

      expect(container.resolve('target0').callDependency()).toBe('calledTarget1')
      expect(container.resolve('target1').callDependency()).toBe('calledTarget0')

      expect(container.bundle.target0.call()).toBe('calledTarget0')
      expect(container.bundle.target1.call()).toBe('calledTarget1')

      expect(container.bundle.target0.callDependency()).toBe('calledTarget1')
      expect(container.bundle.target1.callDependency()).toBe('calledTarget0')
    })
    it('should resolve cyclic dependency graph with target dependencies when destructuring bundle', () => {
      const container = new Container()

      const target0 = ({ target1 }: Bundle) => ({
        call: () => 'called_target0',
        callDependency: () => target1.call(),
      })

      const target1 = ({ target0 }: Bundle) => ({
        call: () => 'called_target1',
        callDependency: () => target0.call(),
      })


      container.register(TestRegistration.create({ token: 'target0', target: target0 }))
      container.register(TestRegistration.create({ token: 'target1', target: target1 }))

      expect(container.bundle.target0.call()).toBe('called_target0')
      expect(container.bundle.target1.call()).toBe('called_target1')

      expect(container.bundle.target0.callDependency()).toBe('called_target1')
      expect(container.bundle.target1.callDependency()).toBe('called_target0')
    })
    it('should resolve cyclic dependency graph when objects are directly accessed during resolution', () => {
      const container = new Container()
  
      const target0 = (bundle: Bundle) => ({
        target1: bundle.target1.value,
        value: 'target0',
      })
  
      const target1 = (bundle: Bundle) => ({
        target0: bundle.target0.value,
        value: 'target1',
      })

      const scopedRegistration0 = TestRegistration.create({ token: 'target0', target: target0 })
      const scopedRegistration1 = TestRegistration.create({ token: 'target1', target: target1 })

      container.register(scopedRegistration0),
      container.register(scopedRegistration1),

      expect(container.bundle.target0.value).toBe('target0')
      // expect(container.bundle.target0.target1).toBe('target1')
  
      expect(container.bundle.target1.value).toBe('target1')
      // expect(container.bundle.target1.target0).toBe('target0')
    })
  })

  describe('bundle', () => {
    it('should return undefined when accessing nonexistent registration', () => {
      const container = new Container()
      expect(container.bundle.registration).toBe(undefined)
      expect(container.bundle['registration']).toBe(undefined)
    })
    it('should return resolved registration when accessing existent registration', () => {
      const container = new Container()
      const registration0 = TestRegistration.create({ token: 'registration0' })

      container.register(registration0)
      expect(container.bundle.registration0).toBe('registration0')
      expect(container.bundle['registration0']).toBe('registration0')
    })
    it('should return registered keys when manipulating bundle', () => {
      const container = new Container()
      const registration0 = TestRegistration.create({ token: 'registration0' })
      const registration1 = TestRegistration.create({ token: 'registration1' })

      container.register(registration0)
      container.register(registration1)

      expect(Object.keys(container.bundle)).toEqual(expect.arrayContaining([
        registration0.token,
        registration1.token,
      ]))
    })
    it('should return  enumerable property descriptors when manipulating bundle', () => {
      const container = new Container()
      const registration0 = TestRegistration.create({ token: 'registration0' })
      const registration1 = TestRegistration.create({ token: 'registration1' })

      container.register(registration0)
      container.register(registration1)

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[registration0.token.toString()]?.enumerable).toBe(true)
      expect(descriptors[registration1.token.toString()]?.enumerable).toBe(true)
    })
    it('should return configurable property descriptors when manipulating bundle',() => {
      const container = new Container()
      const registration0 = TestRegistration.create({ token: 'registration0' })
      const registration1 = TestRegistration.create({ token: 'registration1' })

      container.register(registration0)
      container.register(registration1)

      const descriptors = Object.getOwnPropertyDescriptors(container.bundle)

      expect(Object.keys(descriptors).length).toBe(2)
      expect(descriptors[registration0.token.toString()]?.configurable).toBe(true)
      expect(descriptors[registration1.token.toString()]?.configurable).toBe(true)
    })
  })

  describe('register',  () => {
    it('should register single registration', () => {
      const container = new Container()

      const scopedRegistration = container.register(
        TestRegistration.create({ token: 'target0' }),
      )

      expect(scopedRegistration.resolve()).toBe('target0')
    })
    it('should register multiple registrations', () => {
      const container = new Container()

      const scopedRegistrations = [
        container.register(TestRegistration.create({ token: 'target0' })),
        container.register(TestRegistration.create({ token: 'target1' })),
      ]

      expect(scopedRegistrations[0]?.resolve()).toBe('target0')
      expect(scopedRegistrations[1]?.resolve()).toBe('target1')
    })
    it('should throw error if registration map does not contain registration', () => {
      const container = new Container()

      container.register(TestRegistration.create({ token: 'token' }))

      Object.defineProperty(container, '_registrations', {
        value: new Map([ ['token', undefined] ])
      });

      expect(() => {container.resolve('token')}).toThrow('Token "token" is not a valid registration.')
    })
    it('should return scoped registration when registering single registration', () => {
      const container = new Container()

      const registration0 = TestRegistration.create({ token: 'target0' })
      const registration1 = TestRegistration.create({ token: 'target1' })

      const scopedRegistration0 = container.register(registration0)
      const scopedRegistration1 = container.register(registration1)

      expect(scopedRegistration0).not.toBe(registration0)
      expect(scopedRegistration1).not.toBe(registration1)
    })
    it('should return scoped registration when registering multiple registrations', () => {
      const container = new Container()

      const registration0 = TestRegistration.create({ token: 'target0' })
      const registration1 = TestRegistration.create({ token: 'target1' })

      const scopedRegistrations = [
        container.register(registration0),
        container.register(registration1),
      ]

      expect(scopedRegistrations[0]).not.toBe(registration0)
      expect(scopedRegistrations[1]).not.toBe(registration1)
    })
    it('should override registration token when registering single registration', () => {
      const container = new Container()
  
      container.register(TestRegistration.create({ token: 'target0' }))
    
      expect(container.has('target0')).toBe(true)
      expect(container.resolve('target0')).toBe('target0')

      container.register(TestRegistration.create({ token: 'target0', target: () => {
        return 'another'
      }}))

      expect(container.has('target0')).toBe(true)
      expect(container.resolve('target0')).toBe('another')
    })
    it('should override registration token when registering multiple registrations', () => {
      const container = new Container()
  
      container.register(TestRegistration.create({ token: 'target0' }))
      container.register(TestRegistration.create({ token: 'target1' }))
    
      expect(container.has('target0')).toBe(true)
      expect(container.resolve('target0')).toBe('target0')

      container.register(TestRegistration.create({ token: 'target0', target: () => 'another0' }))
      container.register(TestRegistration.create({ token: 'target1', target: () => 'another1' }))

      expect(container.has('target0')).toBe(true)
      expect(container.has('target1')).toBe(true)
      expect(container.resolve('target0')).toBe('another0')
      expect(container.resolve('target1')).toBe('another1')
    })
  })

  // describe('clone', () => {
  //   it('should merge bundle properties', () => {
  //     const container = new Container({ bundle: { registration0: 'registration0' }})

  //     container.register(TestRegistration.create({ token: 'registration1' }))
  //     const clone = container.clone({ registration2: 'registration2' })

  //     expect(container).not.toBe(clone)
  //     expect(clone.bundle.registration0).toEqual('registration0')
  //     expect(clone.bundle.registration1).toEqual('registration1')
  //     expect(clone.bundle.registration2).toEqual('registration2')
  //   })
  //   it('should not override bundle properties when cloning', () => {
  //     const container = new Container({ bundle: { 
  //       registration0: 'invalid_registration0',
  //       registration1: 'registration1',
  //     }})

  //     const bundle = { 
  //       registration0: 'invalid_registration0',
  //       registration2: 'registration2',
  //     }

  //     container.register(TestRegistration.create({ token: 'registration0' }))
  //     const clone = container.clone(bundle)

  //     expect(container).not.toBe(clone)
  //     expect(clone.bundle.registration0).toEqual('registration0')
  //     expect(clone.bundle.registration1).toEqual('registration1')
  //     expect(clone.bundle.registration2).toEqual('registration2')
  //   })
  // })

  // describe('useBundle', () => {
  //   it('should use external bundle as is', () => {
  //     const container0 = new Container()

  //     container0.register(TestRegistration.create({
  //       token: 'target0',
  //       target: (bundle) => ({
  //         value: 'target0',  
  //         target1: bundle.target1.value,
  //       })
  //     }))

  //     container0.register(TestRegistration.create({
  //       token: 'target1',
  //       target: (bundle) => ({
  //         value: 'target1',
  //         target0: bundle.target0.value,
  //         target2: bundle.target2.value,
  //       })
  //     }))

  //     container0.useBundle({
  //       target2: { value: 'target2' }
  //     })

  //     expect(container0.resolve('target0').value).toBe('target0')
  //     expect(container0.resolve('target1').value).toBe('target1')
  //     expect(container0.resolve('target1').target0).toBe('target0')
  //     expect(container0.resolve('target0').target1).toBe('target1')
  //     expect(container0.resolve('target1').target2).toBe('target2')
  //   })
  // })

  describe('useRegistration', () => {
    it('should use external registration as is', () => {
      const container0 = new Container()

      container0.register(TestRegistration.create({
        token: 'target0',
        target: (bundle) => ({
          value: 'target0',  
        })
      }))

      const scopedRegistration1 = container0.register(TestRegistration.create({
        token: 'target1',
        target: (bundle) => ({
          value: 'target1',
          target0: bundle.target0.value,
        })
      }))

      const container1 = new Container()

      container1.register(TestRegistration.create({
        token: 'target2',
        target: (bundle) => ({
          value: 'target2',  
        })
      }))

      container1.useRegistration(scopedRegistration1)

      expect(container1.resolve('target2').value).toBe('target2')
      expect(container1.resolve('target1').value).toBe('target1')
      expect(container1.resolve('target1').target0).toBe('target0')
    })
  })
})
