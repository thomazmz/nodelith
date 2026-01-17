import { InjectionContainer } from './injection-container'
import { InjectionRegistration } from './injection-registration'
import { CoreInitializer } from '@nodelith/core'

describe('InjectionContainer', () => {
  it('maps and resolves value registrations', () => {
    const container = InjectionContainer.create()
    container.mapValueRegistration('answer', 42)

    expect(container.resolve('answer')).toBe(42)
  })

  it('throws when resolving unknown tokens', () => {
    const container = InjectionContainer.create()
    expect(() => container.resolve('missing')).toThrow(/does not have a registration/)
  })

  it('prevents duplicate registrations for the same token', () => {
    const container = InjectionContainer.create()
    container.mapValueRegistration('token', 'first')

    expect(() => container.mapValueRegistration('token', 'second')).toThrow(/already has a registration/)
  })

  it('wires dependencies through params and the bundle', () => {
    const container = InjectionContainer.create()
    container.mapValueRegistration('dep', 3)
    container.mapFunctionRegistration(
      'adder',
      (dep: number) => dep + 1,
      { params: ['dep'], lifecycle: 'transient' },
    )

    expect(container.resolve<number>('adder')).toBe(4)
  })

  it('runs initializers and registers their outputs', async () => {
    class Init implements CoreInitializer<{ ready: boolean }> {
      public initialize() {
        return { ready: true }
      }
    }

    const container = InjectionContainer.create()
    container.mapClassInitializer('init', Init, { params: [] })

    await container.initialize()

    expect(container.resolve<{ ready: boolean }>('init')).toEqual({ ready: true })
  })

  it('resolves registrations ad-hoc without mapping', () => {
    const container = InjectionContainer.create()
    const value = container.resolveFunction(() => 'ok', { params: [] } as any)
    expect(value).toBe('ok')
  })

  it('allows importing existing registrations', () => {
    const container = InjectionContainer.create()
    const registration = InjectionRegistration.createValueRegistration('value', { token: 'shared' })

    container.useRegistration(registration)

    expect(container.resolve('shared')).toBe('value')
  })
})
