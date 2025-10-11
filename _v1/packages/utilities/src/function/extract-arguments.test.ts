import { extractArguments } from './extract-arguments'

describe('extract-arguments', () => {
  it('should extract function arguments', () => {
    const result = extractArguments((argumentOne: number, argumentTwo: number) => {
      return [argumentOne, argumentTwo]
    })

    expect(result).toEqual(['argumentOne', 'argumentTwo'])
  })

  it('should extract arrow function arguments', () => {
    const result = extractArguments((argumentOne: number, argumentTwo: number) => {
      return [argumentOne, argumentTwo]
    })
    expect(result).toEqual(['argumentOne', 'argumentTwo'])
  })

  it('should extract function arguments when function is declared in its own block scope', () => {
    function someFunction(argumentOne: number, argumentTwo: number) {
      return [argumentOne, argumentTwo]
    }
    const result = extractArguments(someFunction)
    expect(result).toEqual(['argumentOne', 'argumentTwo'])
  })
})  