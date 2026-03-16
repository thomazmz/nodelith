import { MetadataKey } from './metadata-key'
import { MetadataProperties } from './metadata-properties'

type ExampleMetadata = {
  name?: string
  options?: {
    enabled?: boolean
    tags?: string[]
  }
}

describe('MetadataProperties', () => {
  it('extract returns an empty frozen object when unset', () => {
    class Example {}
    const key = MetadataKey.create<ExampleMetadata>('example')

    const meta = MetadataProperties.extract<ExampleMetadata>(Example, key)
    expect(meta).toEqual({})
    expect(Object.isFrozen(meta)).toBe(true)
  })

  it('append deep-merges patches and concatenates arrays', () => {
    class Example {}
    const key = MetadataKey.create<ExampleMetadata>('example')

    MetadataProperties.append<ExampleMetadata>(Example, key, { name: 'demo' })
    MetadataProperties.append<ExampleMetadata>(Example, key, { options: { enabled: true, tags: ['a'] } })
    MetadataProperties.append<ExampleMetadata>(Example, key, { options: { tags: ['b'] } })

    expect(MetadataProperties.extract<ExampleMetadata>(Example, key)).toEqual({
      name: 'demo',
      options: { enabled: true, tags: ['a', 'b'] },
    })
  })

  it('clear removes the stored metadata', () => {
    class Example {}
    const key = MetadataKey.create<ExampleMetadata>('example')

    MetadataProperties.append<ExampleMetadata>(Example, key, { name: 'demo' })
    expect(MetadataProperties.extract<ExampleMetadata>(Example, key)).toEqual({ name: 'demo' })

    MetadataProperties.clear(Example, key)
    expect(MetadataProperties.extract<ExampleMetadata>(Example, key)).toEqual({})
  })

  it('stored property is non-enumerable', () => {
    const target = {}
    const key = MetadataKey.create<ExampleMetadata>('example')

    MetadataProperties.append<ExampleMetadata>(target, key, { name: 'demo' })

    expect(Object.keys(target)).toEqual([])
    const symbols = Object.getOwnPropertySymbols(target)
    expect(symbols).toContain(key)

    const descriptor = Object.getOwnPropertyDescriptor(target, key)
    expect(descriptor?.enumerable).toBe(false)
  })
})

