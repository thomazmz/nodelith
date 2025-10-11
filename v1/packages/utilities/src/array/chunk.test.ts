import { chunk } from './chunk'

describe('chunk', () => {
  it('should chunk and array', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8]
    const expectedChunkArray = [[1, 2, 3], [4, 5, 6], [7, 8]]
    expect(chunk(array, 3)).toEqual(expectedChunkArray)
  })
})