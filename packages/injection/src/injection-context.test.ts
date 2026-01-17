import { InjectionContext } from './injection-context'

describe('InjectionContext', () => {
  it('caches resolutions per identity', () => {
    const context = InjectionContext.create()
    let calls = 0
    const factory = () => {
      calls += 1
      return { marker: Math.random() }
    }

    const first = context.resolve(factory)
    const second = context.resolve(factory)

    expect(first).toBe(second)
    expect(calls).toBe(1)
  })
})
