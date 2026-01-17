import { InjectionTrace } from './injection-trace'
import { InjectionRegistration } from './injection-registration'

describe('InjectionTrace', () => {
  it('rejects cyclic dependency graphs', () => {
    const trace = InjectionTrace.create()
    const registration = {
      token: 'a',
      resolve: jest.fn(() => trace.resolve(registration)),
    } as unknown as InjectionRegistration

    expect(() => trace.resolve(registration)).toThrow(/Cyclic dependency graph/)
  })

  it('delegates resolution to registration', () => {
    const trace = InjectionTrace.create()
    const registration = {
      token: 'dep',
      resolve: jest.fn(() => 'ok'),
    } as unknown as InjectionRegistration

    expect(trace.resolve(registration)).toBe('ok')
    expect(registration.resolve).toHaveBeenCalled()
  })
})
