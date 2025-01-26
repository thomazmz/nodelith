import { StaticRegistration } from './static-registration'

describe('StaticRegistration',  () => {
  describe('resolve', () => {
    it('Should resolve static value', () => {
      const registration = StaticRegistration.create({ static: 'value' })
      expect(registration.resolve()).toBe('value')
    })
  })
  
  describe('clone', () => {
    it('Should keep the same options when cloning', () => {
      const registration = StaticRegistration.create({
        access: 'private',
        static: 'value', 
        token: 'token',
      })

      const clone = registration.clone()

      expect(clone.access).toBe('private')
      expect(clone.token).toBe('token')
    })
  })
  
})