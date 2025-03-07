import { StaticRegistration } from "./static-registration"

describe('StaticRegistration',  () => {
  it('Should resolve static registration value statically', () => {
    const registration = StaticRegistration.create('value')
    const resolution = registration.resolve()
    expect(resolution).toEqual('value')
  })
  it('Should resolve static registration object statically', () => {
    const registration = StaticRegistration.create({ key: 'value' })
    const resolution = registration.resolve()
    expect(resolution).toEqual({ key: 'value' })
  })
  it('Should resolve static registration to the same object', () => {
    const registration = StaticRegistration.create({ key: 'value' })
    const resolution_0 = registration.resolve()
    const resolution_1 = registration.resolve()
    expect(resolution_0).toEqual(resolution_1)
  })
})