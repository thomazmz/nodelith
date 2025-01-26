import { randomUUID } from 'crypto'
import { FunctionRegistration } from './function-registration'

describe('FunctionRegistration',  () => {
  it('Should resolve function value dynamically', () => {
    const registration = FunctionRegistration.create({ function: () => 'value' })
    const resolution = registration.resolve()
    expect(resolution).toBe('value')
  })

  it('Should resolve function as singleton by default', () => {
    const registration = FunctionRegistration.create({ function: () => randomUUID() })
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()       
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve function as singleton explicitly', () => {
    const registration = FunctionRegistration.create({ lifetime: 'singleton', function: () => randomUUID() })
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()       
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve function as transient explicitly', () => {
    const registration = FunctionRegistration.create({ lifetime: 'transient', function: () => randomUUID() })
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()       
    expect(resolution_0).not.toBe(resolution_1)
    expect(resolution_0).toBeDefined()
    expect(resolution_1).toBeDefined()
  })

  it('Should inject custom bundle during resolution', () => {
    const bundle_0 = { dependency_0: 'dependency_0' }
    const bundle_1 = { dependency_1: 'dependency_1' }

    const registration = FunctionRegistration.create({ mode: 'bundle', bundle: bundle_0, function: (dependencies) => {
      return `${dependencies.dependency_0}_${dependencies.dependency_1}`
    }})

    const resolution = registration.resolve(bundle_1)
    expect(resolution).toBe("dependency_0_dependency_1")
  })

  it('should inject custom bundles during clone resolution', () => {
    const bundle_0 = { dependency_0: 'dependency_0' }
    const bundle_1 = { dependency_1: 'dependency_1' }
    const bundle_2 = { dependency_2: 'dependency_2' }

    const registration = FunctionRegistration.create({ mode: 'bundle', bundle: bundle_0, function: (dependencies) => {
      return `${dependencies.dependency_0}_${dependencies.dependency_1}_${dependencies.dependency_2}`
    }})

    const clone = registration.clone(bundle_1)
    const resolution = clone.resolve(bundle_2)
    expect(resolution).toBe("dependency_0_dependency_1_dependency_2")
  })

  it('should return different registration instances when cloning', () => {
    const registration_0 = FunctionRegistration.create({ function: () => randomUUID() })
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

    const registration = FunctionRegistration.create({ bundle: bundle_0, function: (dependency_0, dependency_1) => {
      return `${dependency_0}_${dependency_1}`
    }})

    const resolution = registration.resolve(bundle_1)
    expect(resolution).toBe("dependency_0_dependency_1")
  })

  it('should inject parameters in positional order when explicitly set', () => {
    const bundle_0 = { dependency_0: 'dependency_0' }
    const bundle_1 = { dependency_1: 'dependency_1' }

    const registration = FunctionRegistration.create({ mode: 'spread', bundle: bundle_0, function: (dependency_0, dependency_1) => {
      return `${dependency_0}_${dependency_1}` 
    }})

    const resolution = registration.resolve(bundle_1)
    expect(resolution).toBe("dependency_0_dependency_1")
  })

  it('should inject parameters as bundle object when explicitly set', () => {
    const bundle_0 = { dependency_0: 'dependency_0' }
    const bundle_1 = { dependency_1: 'dependency_1' }

    const registration = FunctionRegistration.create({ mode: 'spread', bundle: bundle_0, function: (dependency_0, dependency_1) => {
      return `${dependency_0}_${dependency_1}`
    }})

    const resolution = registration.resolve(bundle_1)
    expect(resolution).toBe("dependency_0_dependency_1")
  })
})