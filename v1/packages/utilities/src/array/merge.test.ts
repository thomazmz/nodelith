import { merge } from './merge'

describe('merge', () => {
  it('should combine arrays in accordance to callback function', () => {
    const arrayOne = [1, 2, 3]
    const arrayTwo = [4, 5, 6]

    const mergedArray = merge(arrayOne, arrayTwo, (itemFromArrayOne, itemFromArrayTwo) => {
      return (itemFromArrayOne ?? 0) + (itemFromArrayTwo ?? 0)
    })

    expect(mergedArray).toEqual([5, 7, 9])
  })

  it('should combine arrays of different size', () => {
    const arrayOne = [1, 2, 3]
    const arrayTwo = [4, 5, 6, 7, 8]

    const mergedArray = merge(arrayOne, arrayTwo, (itemFromArrayOne, itemFromArrayTwo) => {
      return (itemFromArrayOne ?? 0) + (itemFromArrayTwo ?? 0)
    })

    expect(mergedArray).toEqual([5, 7, 9, 7, 8])
  })
})
