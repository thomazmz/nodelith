import { InitializerRegistration } from './initializer-registration'

describe('InitializerRegistration', () => {
  it('should pass', async () => {
    const registration = InitializerRegistration.create({
      constructor: class {
        async initialize() {
          return { name: 'Thomaz' }
        }
      }
    })
    await registration.initialize()

    console.log(registration.resolve())

    const registration_1 = registration.clone()

    registration_1.resolve()
  })
})
