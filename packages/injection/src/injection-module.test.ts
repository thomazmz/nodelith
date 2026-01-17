import { InjectionModule } from './injection-module'

describe('InjectionModule', () => {
  it('resolves registrations from imported modules', () => {
    const moduleA = InjectionModule.create()
    moduleA.mapValueRegistration('token', 'value')

    const moduleB = InjectionModule.create()
    moduleB.useModule(moduleA)

    expect(moduleB.resolve('token')).toBe('value')
  })

  it('shares singleton instances across composed modules', () => {
    const moduleA = InjectionModule.create()
    let calls = 0
    moduleA.mapFunctionRegistration(
      'counter',
      () => {
        calls += 1
        return { calls }
      },
      { lifecycle: 'singleton' },
    )

    const moduleB = InjectionModule.create()
    moduleB.useModule(moduleA)

    const first = moduleB.resolve<{ calls: number }>('counter')
    const second = moduleB.resolve<{ calls: number }>('counter')

    expect(first).toBe(second)
    expect(calls).toBe(1)
  })
})
