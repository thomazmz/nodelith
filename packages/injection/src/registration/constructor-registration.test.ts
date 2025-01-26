import { randomUUID } from "crypto"
import { ConstructorRegistration } from "./constructor-registration"

describe('ConstructorRegistration',  () => {
  it('Should resolve constructor dynamically', () => {
    const registration = ConstructorRegistration.create({ constructor: class { key = 'value' }})
    const resolution = registration.resolve()
    expect(resolution).toEqual({ key: 'value' })
  })

  it('Should resolve constructor as singleton by default', () => {
    const registration = ConstructorRegistration.create({ constructor: class { key = randomUUID() }})
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve constructor as singleton explicitly', () => {
    const registration = ConstructorRegistration.create({ lifetime: 'singleton', constructor: class { key = randomUUID() }})
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve function as transient explicitly', () => {
    const registration = ConstructorRegistration.create({ lifetime: 'transient', constructor: class { key = randomUUID() }})
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()       
    expect(resolution_0).not.toBe(resolution_1)
    expect(resolution_0).toBeDefined()
    expect(resolution_1).toBeDefined()
  })

  it('should inject custom bundle during resolution', () => {
    const bundle_0 = { dependency_0: 'dependency_0' }
    const bundle_1 = { dependency_1: 'dependency_1' }

    const registration = ConstructorRegistration.create({ mode: 'bundle', bundle: bundle_0, constructor: class { 
      public readonly dependency_0: string
      public readonly dependency_1: string
      constructor(bundle: any) {
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

    const registration = ConstructorRegistration.create({ 
      mode: 'bundle', 
      bundle: bundle_0, 
      constructor: class { 
        public readonly dependency_0: string
        public readonly dependency_1: string
        public readonly dependency_2: string
        constructor(bundle: any) {
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
    const registration_0 = ConstructorRegistration.create({ constructor: class { key = randomUUID() }})
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

    const registration = ConstructorRegistration.create({ bundle: bundle_0, constructor: class { 
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

    const registration = ConstructorRegistration.create({ mode: 'spread', bundle: bundle_0, constructor: class { 
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

    const registration = ConstructorRegistration.create({ mode: 'spread', bundle: bundle_0, constructor: class { 
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