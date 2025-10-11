import { UtilsFunction } from "./utils-function"

export type UtilsObject = object

export declare namespace UtilsObject {
  export type FunctionMember = Member<UtilsFunction> & {
    value: UtilsFunction
  }

  export type Member<T = any> = TypedPropertyDescriptor<T> & {
    key: string | number | symbol
  }
}

export function extractMember<T extends UtilsObject>(object: T, key: keyof T): UtilsObject.Member | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(object, key)
  return descriptor ? { ...descriptor, key } : undefined
}

export function extractMembers<T extends UtilsObject>(object: T): UtilsObject.Member[] {
  const descriptors = Object.getOwnPropertyDescriptors(object)
  return Object.entries(descriptors).map(([key, descriptor]) => {
    return ({ ...descriptor, key })
  })
}

export function isConstructorMember(member: UtilsObject.Member): boolean {
  return isFunctionMember(member)
     && member.key === 'constructor'
}

export function isFunctionMember(member: UtilsObject.Member): boolean {
  return typeof member.value === 'function'
}

export const UtilsObject = {
  extractMember,
  extractMembers,
  isFunctionMember,
  isConstructorMember,
}
