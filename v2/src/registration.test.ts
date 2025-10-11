import { Registration } from './registration'
import { Resolver } from './resolver'
import { Context } from './context'
import { Bundle } from './bundle'

describe('Registration', () => {
  const factory = (bundle?: Bundle) => ({ 
    timestamp: Date.now(),
    bundle, 
  })

  const resolver = jest.fn(Resolver.create({ factory }))

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calling resolve with singleton lifecycle', () => {
    it('resolves using the default root context (singleton)', () => {
      const registration = Registration.create({ 
        factory: resolver,
      })

      const resolution_0 = registration.resolve()
      const resolution_1 = registration.resolve()
      expect(resolution_0).toBe(resolution_1)
      expect(resolver).toHaveBeenCalledTimes(1)
    })

    it('resolves with a provided bundle', () => {
      const bundle = { foo: 'bar' }
      const registration = Registration.create({
        factory: resolver,
      })

      const resolution = registration.resolve({ bundle })
      expect(resolution.bundle).toBe(bundle)
    })
  })

  describe('calling resolve with transient lifecycle', () => {
    it('returns a new resolution every time', () => {
      const registration = Registration.create({
        factory: resolver,
        lifecycle: 'transient',
      })

      const resolution_0 = registration.resolve()
      const resolution_1 = registration.resolve()
      expect(resolution_0).not.toBe(resolution_1)
      expect(resolver).toHaveBeenCalledTimes(2)
    })

    it('passes the bundle to the resolver', () => {
      const bundle = { foo: 'bar' }
      const registration = Registration.create({ 
        factory: resolver, 
        lifecycle: 'transient',
      })

      const resolution = registration.resolve({ bundle })
      expect(resolution.bundle).toBe(bundle)
    })
  })

  describe('calling resolve with scoped lifecycle', () => {
    it('resolves using the provided context', () => {
      const context = Context.create()
      const registration = Registration.create({ 
        factory: resolver,
        lifecycle: 'scoped',
      })

      const resolution_0 = registration.resolve({ context })
      const resolution_1 = registration.resolve({ context })
      expect(resolution_0).toBe(resolution_1)
      expect(resolver).toHaveBeenCalledTimes(1)
    })

    it('throws if no context is provided for scoped lifecycle', () => {
      const registration = Registration.create({
        factory: resolver, 
        lifecycle: 'scoped',
      })

      expect(() => registration.resolve()).toThrow('Could not resolve scoped registration. Missing resolution context')
    })
  })

  describe('calling resolve with invalid lifecycle', () => {
    it('throws for invalid lifecycle types', () => {
      const registration = Registration.create({
        factory: resolver,
        lifecycle: 'invalid' as any,
      })

      expect(() => registration.resolve()).toThrow('Could not resolve registration. Invalid "invalid" lifecycle.')
    })
  })

  describe('clone', () => {
    it('creates a copy of the registration with merged options', () => {
      const registration = Registration.create({
        factory: resolver,
        lifecycle: 'singleton',
      })

      const context = Context.create()

      const registrationClone = registration.clone({ context })

      const resolution_0 = registration.resolve()
      const resolution_1 = registrationClone.resolve()

      expect(resolution_0).not.toBe(resolution_1)
      expect(resolver).toHaveBeenCalledTimes(2)
    })

    it('inherits the lifecycle from original registration', () => {
      const registration = Registration.create({
        factory: resolver,
        lifecycle: 'transient',
      })

      const registrationClone = registration.clone()
      const resolution_0 = registrationClone.resolve()
      const resolution_1 = registrationClone.resolve()
      expect(resolution_0).not.toBe(resolution_1)
    })
  })
})
