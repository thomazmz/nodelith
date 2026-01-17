import { FunctionType } from './utilities-function'

export type ObjectUtils = object

export declare namespace ObjectUtils {
  export type FunctionMember = Member<FunctionType> & {
    value: FunctionType
  }

  export type Member<T = any> = TypedPropertyDescriptor<T> & {
    key: string | number | symbol
  }
}

export function extractMember<T extends ObjectUtils>(object: T, key: keyof T): ObjectUtils.Member | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(object, key)
  return descriptor ? { ...descriptor, key } : undefined
}

export function extractMembers<T extends ObjectUtils>(object: T): ObjectUtils.Member[] {
  const descriptors = Object.getOwnPropertyDescriptors(object)
  return Object.entries(descriptors).map(([key, descriptor]) => {
    return ({ ...descriptor, key })
  })
}

export function isConstructorMember(member: ObjectUtils.Member): boolean {
  return isFunctionMember(member)
     && member.key === 'constructor'
}

export function isFunctionMember(member: ObjectUtils.Member): boolean {
  return typeof member.value === 'function'
}

export const ObjectUtils = {
  extractMember,
  extractMembers,
  isFunctionMember,
  isConstructorMember,
}
