export const merge = <T extends Object | undefined>(source: T, target: T): T => {
  if(!source) {
    return target
  }

  if(!target) {
    return source
  }

  return Object.entries(source).reduce((acc, [key, value]) => {
    if(value) {

      if(!acc[key]) {
        return { ...acc,
          [key]: value
        }
      }

      if(value && typeof value === 'object') {
        return { ...acc,
          [key]: merge(value, acc[key])
        }
      }

      return { ...acc,
        [key]: value
      }
    }

    return acc
  }, target)
}
