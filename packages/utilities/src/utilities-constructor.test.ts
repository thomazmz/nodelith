import { ConstructorUtilities } from './utilities-constructor'

describe('ConstructorUtilities.extractParameters', () => {
  it('returns declared constructor parameters', () => {
    class Example {
      public constructor(id: string, opts = {}) {}
    }

    expect(ConstructorUtilities.extractParameters(Example)).toEqual(['id', 'opts = {}'])
  })

  it('returns empty list when no constructor is declared', () => {
    class Plain {}
    expect(ConstructorUtilities.extractParameters(Plain)).toEqual([])
  })

  it('throws for native constructors', () => {
    expect(() => ConstructorUtilities.extractParameters(Date as any)).toThrow(/native code/i)
  })
})
