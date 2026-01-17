import { InjectionBundle } from './injection-bundle'
import { InjectionContext } from './injection-context'
import { InjectionRegistration } from './injection-registration'

describe('InjectionBundle', () => {
  it('exposes entries as lazy properties with the provided context and bundle', () => {
    const fakeContext = InjectionContext.create()
    const resolve = jest.fn(() => 'value')
    const registration = { token: 'foo', resolve } as unknown as InjectionRegistration

    const bundle = InjectionBundle.create({
      context: fakeContext,
      entries: [['foo', registration]],
    })

    const descriptor = Object.getOwnPropertyDescriptor(bundle, 'foo')
    expect(descriptor?.enumerable).toBe(true)

    expect(bundle['foo']).toBe('value')
    expect(resolve).toHaveBeenCalledWith({ context: fakeContext, bundle })
  })
})

