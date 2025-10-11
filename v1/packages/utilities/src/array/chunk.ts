export function chunk<T>(array: T[], chunkSize: number): T[][] {
  const arrayLength = array.length
  const result: T[][] = []

  for(let index = 0; index < arrayLength; index += chunkSize) {
    const newChunk = array.slice(index, index + chunkSize)
    result.push(newChunk)
  }
  
  return result;
}
