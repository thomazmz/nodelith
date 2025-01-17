import { randomUUID } from 'crypto'

import { Bundle } from '../bundle'
import { Registration } from '../registration'

describe('Registration', () => {
  describe('create', () => {
    describe('static',  () => {
      it('Should resolve static value', () => {
        const registration = Registration.create({ static: 'value' })
        expect(registration.resolve()).toBe('value')
      })
    })
    describe('function',  () => {
      it('Should resolve function value dynamically', () => {
        const registration = Registration.create({ function: () => 'value' })
        const resolution = registration.resolve()
        expect(resolution).toBe('value')
      })
      it('Should resolve function as singleton by default', () => {
        const registration = Registration.create({ function: () => randomUUID() })
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()       
        expect(resolution_0).toBe(resolution_1)
      })
      it('Should resolve function as singleton explicitly', () => {
        const registration = Registration.create({ lifetime: 'singleton', function: () => randomUUID() })
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()       
        expect(resolution_0).toBe(resolution_1)
      })
      it('Should resolve function as transient explicitly', () => {
        const registration = Registration.create({ lifetime: 'transient', function: () => randomUUID() })
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()       
        expect(resolution_0).not.toBe(resolution_1)
        expect(resolution_0).toBeDefined()
        expect(resolution_1).toBeDefined()
      })
      it('Should inject custom bundle during resolution', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'bundle', bundle: bundle_0, function: (dependencies) => {
          return `${dependencies.dependency_0}_${dependencies.dependency_1}`
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution).toBe("dependency_0_dependency_1")
      })
      it('should inject custom bundles during clone resolution', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }
        const bundle_2 = { dependency_2: 'dependency_2' }

        const registration = Registration.create({ mode: 'bundle', bundle: bundle_0, function: (dependencies) => {
          return `${dependencies.dependency_0}_${dependencies.dependency_1}_${dependencies.dependency_2}`
        }})

        const clone = registration.clone(bundle_1)
        const resolution = clone.resolve(bundle_2)
        expect(resolution).toBe("dependency_0_dependency_1_dependency_2")
      })
      it('should return different registration instances when cloning', () => {
        const registration_0 = Registration.create({ function: () => randomUUID() })
        const resolution_0 = registration_0.resolve()
        const registration_1 = registration_0.clone()
        const resolution_1 = registration_1.clone()

        expect(registration_0).not.toBe(registration_1)
        expect(resolution_0).not.toBe(resolution_1)

        expect(resolution_0).toBeDefined()
        expect(resolution_1).toBeDefined()
      })
      it('should inject parameters in positional order by default', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ bundle: bundle_0, function: (dependency_0, dependency_1) => {
          return `${dependency_0}_${dependency_1}`
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution).toBe("dependency_0_dependency_1")
      })
      it('should inject parameters in positional order when explicitly set', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'spread', bundle: bundle_0, function: (dependency_0, dependency_1) => {
          return `${dependency_0}_${dependency_1}` 
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution).toBe("dependency_0_dependency_1")
      })
      it('should inject parameters as bundle object when explicitly set', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'spread', bundle: bundle_0, function: (dependency_0, dependency_1) => {
          return `${dependency_0}_${dependency_1}`
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution).toBe("dependency_0_dependency_1")
      })
    })
    describe('factory',  () => {
      it('Should resolve factory value dynamically', () => {
        const registration = Registration.create({ factory: () => ({ key: 'value' })})
        const resolution =  registration.resolve()
        expect(resolution).toEqual({ 
          key: 'value'
        })
      })
      it('Should resolve factory as singleton by default', () => {
        const registration = Registration.create({ factory: () => ({ key: randomUUID() })})
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()       
        expect(resolution_0).toBe(resolution_1)
      })
      it('Should resolve factory as singleton explicitly', () => {
        const registration = Registration.create({ lifetime: 'singleton', factory: () => ({ key: randomUUID() })})
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()       
        expect(resolution_0).toBe(resolution_1)
      })
      it('Should resolve function as transient explicitly', () => {
        const registration = Registration.create({ lifetime: 'transient', factory: () => ({ key: randomUUID() })})
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()       
        expect(resolution_0).not.toBe(resolution_1)
        expect(resolution_0).toBeDefined()
        expect(resolution_1).toBeDefined()
      })
      it('Should inject custom bundle during resolution', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'bundle', bundle: bundle_0, factory: (bundle) => ({
          dependency_0:  bundle.dependency_0,
          dependency_1:  bundle.dependency_1,
        })})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
      it('should inject custom bundles during clone resolution', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }
        const bundle_2 = { dependency_2: 'dependency_2' }

        const registration = Registration.create({ mode: 'bundle', bundle: bundle_0, factory: (bundle) => ({
          dependency_0: bundle.dependency_0,
          dependency_1: bundle.dependency_1,
          dependency_2: bundle.dependency_2,
        })})

        const clone = registration.clone(bundle_1)
        const resolution = clone.resolve(bundle_2)

        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
        expect(resolution.dependency_2).toBe(bundle_2.dependency_2)
      })
      it('should return different registration instances when cloning', () => {
        const registration_0 = Registration.create({ factory: () => ({ key: randomUUID() })})
        const resolution_0 = registration_0.resolve()        
        const registration_1 = registration_0.clone()
        const resolution_1 = registration_1.clone()

        expect(registration_0).not.toBe(registration_1)
        expect(resolution_0).not.toBe(resolution_1)

        expect(resolution_0).toBeDefined()
        expect(resolution_1).toBeDefined()
      })
      it('should inject parameters in positional order by default', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ bundle: bundle_0, factory: (dependency_0, dependency_1) => ({
          dependency_0,
          dependency_1,
        })})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
      it('should inject parameters in positional order when explicitly set', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'spread', bundle: bundle_0, factory: (dependency_0, dependency_1) => ({
          dependency_0,
          dependency_1,
         })})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
      it('should inject parameters as bundle object when explicitly set', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'spread', bundle: bundle_0, factory: (dependency_0, dependency_1) => ({
          dependency_0,
          dependency_1,
        })})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
    })
    describe('constructor',  () => {
      it('Should resolve constructor dynamically', () => {
        const registration = Registration.create({ constructor: class { key = 'value' }})
        const resolution = registration.resolve()
        expect(resolution).toEqual({ key: 'value' })
      })
      it('Should resolve constructor as singleton by default', () => {
        const registration = Registration.create({ constructor: class { key = randomUUID() }})
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()
        expect(resolution_0).toBe(resolution_1)
      })
      it('Should resolve constructor as singleton explicitly', () => {
        const registration = Registration.create({ lifetime: 'singleton', constructor: class { key = randomUUID() }})
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()
        expect(resolution_0).toBe(resolution_1)
      })
      it('Should resolve function as transient explicitly', () => {
        const registration = Registration.create({ lifetime: 'transient', constructor: class { key = randomUUID() }})
        const resolution_0 = registration.resolve()
        const resolution_1 = registration.resolve()       
        expect(resolution_0).not.toBe(resolution_1)
        expect(resolution_0).toBeDefined()
        expect(resolution_1).toBeDefined()
      })
      it('should inject custom bundle during resolution', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'bundle', bundle: bundle_0, constructor: class { 
          public readonly dependency_0: string
          public readonly dependency_1: string
          constructor(bundle: Bundle) {
            this.dependency_0 = bundle.dependency_0
            this.dependency_1 = bundle.dependency_1
          }
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
      it('should inject custom bundles during clone resolution', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }
        const bundle_2 = { dependency_2: 'dependency_2' }

        const registration = Registration.create({ 
          mode: 'bundle', 
          bundle: bundle_0, 
          constructor: class { 
            public readonly dependency_0: string
            public readonly dependency_1: string
            public readonly dependency_2: string
            constructor(bundle: Bundle) {
              this.dependency_0 = bundle.dependency_0
              this.dependency_1 = bundle.dependency_1
              this.dependency_2 = bundle.dependency_2 
            }
          }
        })

        const clone = registration.clone(bundle_1)
        const resolution = clone.resolve(bundle_2)

        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
        expect(resolution.dependency_2).toBe(bundle_2.dependency_2)
      })
      it('should return different registration instances when cloning', () => {
        const registration_0 = Registration.create({ constructor: class { key = randomUUID() }})
        const resolution_0 = registration_0.resolve()        
        const registration_1 = registration_0.clone()
        const resolution_1 = registration_1.clone()

        expect(registration_0).not.toBe(registration_1)
        expect(resolution_0).not.toBe(resolution_1)

        expect(resolution_0).toBeDefined()
        expect(resolution_1).toBeDefined()
      })
      it('should inject parameters in positional order by default', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ bundle: bundle_0, constructor: class { 
          constructor(
            public readonly dependency_0: string,
            public readonly dependency_1: string,
          ) { }
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
      it('should inject parameters in positional order when explicitly set', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'spread', bundle: bundle_0, constructor: class { 
          constructor(
            public readonly dependency_0: string,
            public readonly dependency_1: string,
          ) { }
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
      it('should inject parameters as bundle object when explicitly set', () => {
        const bundle_0 = { dependency_0: 'dependency_0' }
        const bundle_1 = { dependency_1: 'dependency_1' }

        const registration = Registration.create({ mode: 'spread', bundle: bundle_0, constructor: class { 
          constructor(
            public readonly dependency_0: string,
            public readonly dependency_1: string,
          ) { }
        }})

        const resolution = registration.resolve(bundle_1)
        expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
        expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
      })
    })
  })
})