import { pipe } from './pipe'

describe('pipe', () => {
  it('should pipe initial value through both functions', async () => {
    const addOne = (i: number) => i+1
    const addTwo = (i: number) => Promise.resolve(i+2)

    const pipeResult = await pipe(5,
      addOne,
      addTwo,
    )

    expect(pipeResult).toBe(8)
  })
})