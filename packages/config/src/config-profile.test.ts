import { ConfigProfile } from './config-profile'

describe('ConfigProfile', () => {
  it('creates boolean profiles', () => {
    expect(ConfigProfile.boolean('FLAG', true)).toEqual(['FLAG', true])
  })

  it('creates number profiles', () => {
    expect(ConfigProfile.number('PORT', 3000)).toEqual(['PORT', 3000])
  })

  it('creates string profiles', () => {
    expect(ConfigProfile.string('NAME', 'app')).toEqual(['NAME', 'app'])
  })
})

