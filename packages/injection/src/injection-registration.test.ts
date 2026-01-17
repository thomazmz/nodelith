import { InjectionRegistration } from './injection-registration'
import { InjectionContext } from './injection-context'
import { InjectionBundle } from './injection-bundle'

describe('InjectionRegistration', () => {
  it('resolves value registrations as provided', () => {
    const registration = InjectionRegistration.createValueRegistration(10, { token: 'num' })
    expect(registration.token).toBe('num')
    expect(registration.visibility).toBe('public')
    expect(registration.resolve()).toBe(10)
  })

  it('honors transient lifecycle', () => {
    const registration = InjectionRegistration.createFunctionRegistration(
      () => ({ id: Symbol() }),
      { params: [], lifecycle: 'transient' },
    )

    const first = registration.resolve()
    const second = registration.resolve()
    expect(first).not.toBe(second)
  })

  it('honors singleton lifecycle', () => {
    const registration = InjectionRegistration.createFunctionRegistration(
      () => ({ id: Symbol() }),
      { params: [], lifecycle: 'singleton' },
    )

    const first = registration.resolve()
    const second = registration.resolve()
    expect(first).toBe(second)
  })

  it('honors scoped lifecycle', () => {
    const registration = InjectionRegistration.createFunctionRegistration(
      () => ({ id: Symbol() }),
      { params: [], lifecycle: 'scoped' },
    )

    const contextA = InjectionContext.create()
    const contextB = InjectionContext.create()

    const a1 = registration.resolve({ context: contextA })
    const a2 = registration.resolve({ context: contextA })
    const b1 = registration.resolve({ context: contextB })

    expect(a1).toBe(a2)
    expect(b1).not.toBe(a1)
  })

  it('injects params from the provided bundle', () => {
    const depRegistration = InjectionRegistration.createValueRegistration(5, { token: 'dep' })
    const bundle = InjectionBundle.create({
      context: InjectionContext.create(),
      entries: [['dep', depRegistration]],
    })

    const registration = InjectionRegistration.createFunctionRegistration(
      (dep: number) => dep * 2,
      { token: 'double', params: ['dep'], lifecycle: 'transient' },
    )

    const result = registration.resolve({
      context: InjectionContext.create(),
      bundle,
    })

    expect(result).toBe(10)
  })

  it('throws on invalid lifecycle values', () => {
    const registration = new (InjectionRegistration as any)(
      () => 'x',
      { lifecycle: 'invalid', params: [] },
    ) as InjectionRegistration

    expect(() => registration.resolve()).toThrow(/Invalid/)
  })
})
