import { FunctionUtilities } from './utilities-function'

describe('FunctionUtilities.extractParameters', () => {
  it('extracts parameters from arrow functions', () => {
    const fn = (a: number, b = 1) => a + b
    expect(FunctionUtilities.extractParameters(fn)).toEqual(['a', 'b = 1'])
  })

  it('extracts parameters from object methods', () => {
    const obj = {
      sum(a: number, b: number) { return a + b },
    }

    expect(FunctionUtilities.extractParameters(obj.sum)).toEqual(['a', 'b'])
  })
})
