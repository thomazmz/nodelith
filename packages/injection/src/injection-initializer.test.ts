import { InjectionInitializer } from './injection-initializer'
import { CoreInitializer } from '@nodelith/core'

describe('InjectionInitializer', () => {
  it('wraps class initializers and returns value registrations', async () => {
    class Init implements CoreInitializer<string> {
      public initialize() {
        return 'ready'
      }
    }

    const initializer = InjectionInitializer.createClassInitializer(Init, { params: [] })
    const registration = await initializer.initialize()

    expect(registration.token).toBe(initializer.token)
    expect(registration.resolve()).toBe('ready')
  })

  it('wraps factory initializers and returns value registrations', async () => {
    const factory = (): CoreInitializer<number> => ({
      initialize: () => 7,
    })

    const initializer = InjectionInitializer.createFactoryInitializer(factory, { params: [] })
    const registration = await initializer.initialize()

    expect(registration.token).toBe(initializer.token)
    expect(registration.resolve()).toBe(7)
  })
})
