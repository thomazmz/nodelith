import { Function } from '@nodelith/types'

export const pipe = <T>(initialValue: T, ...modifiers: Function<T | Promise<T>, [T]>[]): Promise<T> => {
  return modifiers.reduce(async (value, modifierFunction) => {
    const resolvedValue = await value
    return modifierFunction(resolvedValue)
  }, initialValue as Promise<T>)
}
