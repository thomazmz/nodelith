import { Container } from './container'

describe('Container', () => {
  function createStubRegistration(properties?: {
    token?: string
    resolution?: string
  }) {
    return {
      token: properties?.token ?? 'defaultToken',
      resolve: () => properties?.resolution ?? 'resolutionString',
      clone: () => createStubRegistration({
        token: properties?.token ?? 'defaultToken',
        resolution: properties?.resolution ?? 'resolutionString',
      }),
    }
  }

  describe('has', () => {
    it('should return "true" when token is already used', () => {
      const container = new Container()
      const stubRegistration_0 = createStubRegistration({ token: 'stubRegistration' })

      container.push(stubRegistration_0)
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
      const stubRegistration_0 = createStubRegistration({ token: 'stubRegistration_0' })
      const stubRegistration_1 = createStubRegistration({ token: 'stubRegistration_1' })

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      expect(container.has('stubRegistration_0')).toBe(true)
      expect(container.has('stubRegistration_1')).toBe(true)

      expect(container.unpack('stubRegistration_0')?.token).toBe(stubRegistration_0?.token)
      expect(container.unpack('stubRegistration_1')?.token).toBe(stubRegistration_1?.token)
    })

    it('should override registration token', () => {
      const container = new Container()

      const stubRegistration_0 = createStubRegistration({ token: 'stubToken', resolution: 'resolution_0' })
      const stubRegistration_1 = createStubRegistration({ token: 'stubToken', resolution: 'resolution_1' })
      
      container.push(stubRegistration_0)

      expect(container.has('stubToken')).toBe(true)
      expect(container.unpack('stubToken')?.token).toBe('stubToken')
      expect(container.unpack('stubToken')?.resolve()).toBe('resolution_0')

      container.push(stubRegistration_1)

      expect(container.has('stubToken')).toBe(true)
      expect(container.unpack('stubToken')?.token).toBe('stubToken')
      expect(container.unpack('stubToken')?.resolve()).toBe('resolution_1')
    })
  })

  describe('unpack', () => {
    it('should return undefined when unpacking unregistered token', () => {
      const container = new Container()
      const stubRegistration_0 = createStubRegistration({ token: 'stubRegistration_0' })
      const stubRegistration_1 = createStubRegistration({ token: 'stubRegistration_1' })

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )
      
      const undefinedClone = container.unpack('stubRegistration_2')

      expect(undefinedClone).toBe(undefined)
    })

    it('should return registration clone based on token', () => {
      const container = new Container()
      const stubRegistration_0 = createStubRegistration({ token: 'stubRegistration_0' })
      const stubRegistration_1 = createStubRegistration({ token: 'stubRegistration_1' })

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )
      
      const stubRegistrationClone_0 = container.unpack('stubRegistration_0')
      const stubRegistrationClone_1 = container.unpack('stubRegistration_1')

      expect(stubRegistration_0).not.toBe(stubRegistrationClone_0)
      expect(stubRegistration_1).not.toBe(stubRegistrationClone_1)

      expect(stubRegistration_0?.token).toEqual(stubRegistrationClone_0?.token)
      expect(stubRegistration_1?.token).toEqual(stubRegistrationClone_1?.token)
    })

    it('should return registration clones for all registrations', () => {
      const container = new Container()
      const stubRegistration_0 = createStubRegistration({ token: 'stubRegistration_0', resolution: 'resolution_0' })
      const stubRegistration_1 = createStubRegistration({ token: 'stubRegistration_1', resolution: 'resolution_1' })

      container.push(
        stubRegistration_0,
        stubRegistration_1,
      )

      const registrationClones = container.unpack()

      expect([
        { token: stubRegistration_0.token, resolution: stubRegistration_0.resolve() },
        { token: stubRegistration_1.token, resolution: stubRegistration_1.resolve() },
      ]).toEqual(expect.arrayContaining([
        { token: registrationClones[0]?.token, resolution: registrationClones[0]?.resolve() },
        { token: registrationClones[1]?.token, resolution: registrationClones[1]?.resolve() },
      ]))
    })
  })

  describe('bundle', () => {
    it('should throw error when trying to set bundle property', () => {
      const container = new Container() as any

      expect(() => {
        container.bundle.anyRegistration = createStubRegistration({ token: 'anyRegistration' })
      }).toThrow('Could not set registration "anyRegistration". Registration should not be done through bundle.')

      expect(() => {
        container.bundle['anyRegistration'] = createStubRegistration({ token: 'anyRegistration' })
      }).toThrow('Could not set registration "anyRegistration". Registration should not be done through bundle.')
    })

    it('should return undefined when accessing nonexistent registration', () => {
      const container = new Container()
      expect(container.bundle.stubRegistration).toBe(undefined)
      expect(container.bundle['stubRegistration']).toBe(undefined)
    })

    it('should return resolved registration when accessing existent registration', () => {
      const container = new Container()
      const stubRegistration = createStubRegistration({
        token: 'stubRegistration',
        resolution: 'resolutionString',
      })

      container.push(stubRegistration)
      expect(container.bundle.stubRegistration).toBe('resolutionString')
      expect(container.bundle['stubRegistration']).toBe('resolutionString')
    })
  })
})