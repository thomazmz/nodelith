import { StaticRegistration } from './static-registration'

describe('StaticRegistration',  () => {
  it('Should resolve static value', () => {
    const registration = StaticRegistration.create({ static: 'value' })
    expect(registration.resolve()).toBe('value')
  })
})