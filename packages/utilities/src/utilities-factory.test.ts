import { FactoryUtilities } from './utilities-factory'

describe('FactoryUtilities.extractParameters', () => {
  it('delegates to FunctionUtilities for parameter extraction', () => {
    const factory = (name: string, options = {}) => ({ name, options })
    expect(FactoryUtilities.extractParameters(factory)).toEqual(['name', 'options = {}'])
  })
})

