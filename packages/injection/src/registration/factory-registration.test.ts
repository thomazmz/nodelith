import { randomUUID } from "crypto"
import { FactoryRegistration } from './factory-registration'

describe('FactoryRegistration',  () => {
  it('Should resolve factory value dynamically', () => {
    const registration = FactoryRegistration.create({ factory: () => ({ key: 'value' })})
    const resolution =  registration.resolve()
    expect(resolution).toEqual({ 
      key: 'value'
    })
  })

  it('Should resolve factory as singleton by default', () => {
    const registration = FactoryRegistration.create({ factory: () => ({ key: randomUUID() })})
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()       
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve factory as singleton explicitly', () => {
    const registration = FactoryRegistration.create({ lifetime: 'singleton', factory: () => ({ key: randomUUID() })})
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()       
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve function as transient explicitly', () => {
    const registration = FactoryRegistration.create({ lifetime: 'transient', factory: () => ({ key: randomUUID() })})
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()       
    expect(resolution_0).not.toBe(resolution_1)
    expect(resolution_0).toBeDefined()
    expect(resolution_1).toBeDefined()
  })

  it('Should inject custom bundle during resolution', () => {
    const bundle_0 = { dependency_0: 'dependency_0' }
    const bundle_1 = { dependency_1: 'dependency_1' }

    const registration = FactoryRegistration.create({ mode: 'bundle', bundle: bundle_0, factory: (bundle) => ({
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

    const registration = FactoryRegistration.create({ mode: 'bundle', bundle: bundle_0, factory: (bundle) => ({
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
    const registration_0 = FactoryRegistration.create({ factory: () => ({ key: randomUUID() })})
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

    const registration = FactoryRegistration.create({ bundle: bundle_0, factory: (dependency_0, dependency_1) => ({
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

    const registration = FactoryRegistration.create({ mode: 'spread', bundle: bundle_0, factory: (dependency_0, dependency_1) => ({
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

    const registration = FactoryRegistration.create({ mode: 'spread', bundle: bundle_0, factory: (dependency_0, dependency_1) => ({
      dependency_0,
      dependency_1,
    })})

    const resolution = registration.resolve(bundle_1)
    expect(resolution.dependency_0).toBe(bundle_0.dependency_0)
    expect(resolution.dependency_1).toBe(bundle_1.dependency_1)
  })
})