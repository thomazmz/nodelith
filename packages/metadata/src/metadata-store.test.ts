import { MetadataKey } from './metadata-key'
import { MetadataStore } from './metadata-store'

type ExampleMetadata = {
  name?: string
  options?: {
    enabled?: boolean
    tags?: string[]
  }
}

describe('MetadataStore', () => {
  it('creates a store from a string name', () => {
    class Example {}
    const store = MetadataStore.create<ExampleMetadata>('example')

    store.append(Example, { name: 'demo' })
    expect(store.extract(Example)).toEqual({ name: 'demo' })
  })

  it('creates a store from an explicit symbol key', () => {
    class Example {}
    const key = MetadataKey.create<ExampleMetadata>('example')
    const store = MetadataStore.create<ExampleMetadata>(key)

    store.append(Example, { options: { enabled: true } })
    expect(store.extract(Example)).toEqual({ options: { enabled: true } })
  })

  it('clear removes metadata via store', () => {
    class Example {}
    const store = MetadataStore.create<ExampleMetadata>('example')

    store.append(Example, { name: 'demo' })
    expect(store.extract(Example)).toEqual({ name: 'demo' })

    store.clear(Example)
    expect(store.extract(Example)).toEqual({})
  })
})

