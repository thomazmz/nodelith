export function merge<R, U, T>(arrayOfU: U[], arrayOfT: T[],  callback: (u: U | undefined, t:T | undefined) => R) {
  const mergedArrayLength = Math.max(arrayOfU.length, arrayOfT.length)

  return Array(mergedArrayLength).fill(undefined).map((_, index) => {
    return callback(arrayOfU[index], arrayOfT[index])
  })
}

