import { InjectionEntry } from './injection-entry'

describe('InjectionEntry', () => {
  it('stores token and registration together', () => {
    const registration = { token: 'abc', resolve: jest.fn() } as any
    const entry: InjectionEntry = ['abc', registration]

    const [token, reg] = entry
    expect(token).toBe('abc')
    expect(reg).toBe(registration)
  })
})
