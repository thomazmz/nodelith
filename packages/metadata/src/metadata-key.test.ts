import { MetadataKey } from './metadata-key'

describe('MetadataKey', () => {
  it('creates unique symbols (even with same name)', () => {
    const a = MetadataKey.create('x')
    const b = MetadataKey.create('x')
    expect(a).not.toBe(b)
    expect(typeof a).toBe('symbol')
  })
})

