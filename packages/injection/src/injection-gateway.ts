import { ObjectUtils } from '@nodelith/utils'
import { ConstructorUtils } from '@nodelith/utils'
import { InjectionModule } from '@nodelith/injection'

export type InjectionGateway<T> = Pick<T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>

export function createInjectionGateway<T extends object>(constructor: ConstructorUtils<T>, module: InjectionModule): InjectionGateway<T> {
  return Object.freeze(ObjectUtils.extractMembers(constructor.prototype).reduce((gateway, member) => {
    if(ObjectUtils.isConstructorMember(member) || !ObjectUtils.isFunctionMember(member)) {
      return gateway
    }

    const operation = (...args: any[]) => {
      const instance = InjectionModule.resolveClass(constructor, module)
      return instance[member.key].apply(instance, args)
    }

    return Object.defineProperty(gateway, member.key, {
      value: operation,
      configurable: false,
      enumerable: true,
      writable: false,
    })
  }, {} as InjectionGateway<T>))
}

export const InjectionGateway = Object.freeze({
  create: createInjectionGateway
})
