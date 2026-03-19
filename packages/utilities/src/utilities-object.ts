import { FunctionType } from './utilities-function'

export type ObjectType = object

export declare namespace ObjectType {
  export type FunctionMember = Member<FunctionType> & {
    value: FunctionType
  }

  export type Member<T = any> = TypedPropertyDescriptor<T> & {
    key: string | number | symbol
  }
}

export function extractMember<T extends ObjectType>(object: T, key: keyof T): ObjectType.Member | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(object, key)
  return descriptor ? { ...descriptor, key } : undefined
}

export function extractMembers<T extends ObjectType>(object: T): ObjectType.Member[] {
  const descriptors = Object.getOwnPropertyDescriptors(object)
  return Object.entries(descriptors).map(([key, descriptor]) => {
    return ({ ...descriptor, key })
  })
}

export function isConstructorMember(member: ObjectType.Member): boolean {
  return isFunctionMember(member)
     && member.key === 'constructor'
}

export function isFunctionMember(member: ObjectType.Member): boolean {
  return typeof member.value === 'function'
}

export const ObjectUtilities = {
  extractMember,
  extractMembers,
  isFunctionMember,
  isConstructorMember,
}
