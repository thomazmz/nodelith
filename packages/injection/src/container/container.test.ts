import { Container } from './container'

describe('Container', () => {
  function createStubRegistration(token: string = 'someToken') {
    return {
      token,
      resolve: () => 'someString',
      clone: () => createStubRegistration(token),
    }
  }

  describe('has', () => {
    it('should return "true" when token is already used', () => {
      const container = new Container()
      const stubRegistration = createStubRegistration('stubRegistration')

      container.push(stubRegistration)
      expect(container.has('stubRegistration')).toBe(true)
    })

    it('should return "false" when token is already used', () => {
      const container = new Container()
      expect(container.has('stubRegistration')).toBe(false)
    })
  })

  describe('push', () => {
    it('should push registrations as part of the container', () => {
      const container = new Container()
      const stubRegistration_1 = createStubRegistration('stubRegistration_1')
      const stubRegistration_2 = createStubRegistration('stubRegistration_2')

      container.push(
        stubRegistration_1,
        stubRegistration_2,
      )

      expect(container.has('stubRegistration_1')).toBe(true)
      expect(container.has('stubRegistration_2')).toBe(true)

      expect(container.registrations).toEqual(expect.arrayContaining([
        stubRegistration_1,
        stubRegistration_2,
      ]))
    })
  })
})