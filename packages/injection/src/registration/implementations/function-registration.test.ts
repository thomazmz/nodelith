import { randomUUID } from "crypto"
import { FunctionRegistration } from "./function-registration"

describe('FunctionRegistration',  () => {
  it('Should resolve function dynamically', () => {
    const registration = FunctionRegistration.create(() => 'value')
    const resolution = registration.resolve()
    expect(resolution).toEqual('value')
  })

  it('Should resolve function as singleton by default', () => {
    const registration = FunctionRegistration.create(() => randomUUID())
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve function as singleton explicitly', () => {
    const registration = FunctionRegistration.create(() => randomUUID())
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()
    expect(resolution_0).toBe(resolution_1)
  })

  it('Should resolve function as transient explicitly', () => {
    const registration = FunctionRegistration.create(() => randomUUID(), { lifetime: 'transient' })
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()
    expect(resolution_0).not.toBe(resolution_1)
    expect(resolution_0).toBeDefined()
    expect(resolution_1).toBeDefined()
  })

  it('should inject custom bundle during resolution', () => {
    const bundle_0 = { dependency_0: 'dependency_0' }
    const bundle_1 = { dependency_1: 'dependency_1' }

    const testFunction = (bundle: any) => `${bundle.dependency_0}_${bundle.dependency_1}`

    const registration = FunctionRegistration.create(testFunction, { bundle: bundle_0, })

    const resolution = registration.resolve(bundle_1)

    expect(resolution).toBe(
      `${bundle_0.dependency_0}_${bundle_1.dependency_1}`
    )
  })

  it('should inject custom bundles during clone resolution', () => {
    const bundle_1 = { dependency_1: 'dependency_1' }
    const bundle_2 = { dependency_2: 'dependency_2' }

    const testFunction = (bundle: any) => `${bundle.dependency_1}_${bundle.dependency_2}`

    const registration = FunctionRegistration.create(testFunction)

    const clone = registration.clone(bundle_1)
    const resolution = clone.resolve(bundle_2)

    expect(resolution).toBe(`${bundle_1.dependency_1}_${bundle_2.dependency_2}`)
  })

  it('should return different registration instances when cloning', () => {
    const testFunction = () => randomUUID()

    const registration_0 = FunctionRegistration.create(testFunction)
    const resolution_0 = registration_0.resolve()
    const registration_1 = registration_0.clone()
    const resolution_1 = registration_1.clone()

    expect(registration_0).not.toBe(registration_1)
    expect(resolution_0).not.toBe(resolution_1)

    expect(resolution_0).toBeDefined()
    expect(resolution_1).toBeDefined()
  })
})