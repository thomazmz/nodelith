import { ObjectUtils, ConstructorUtils } from '@nodelith/utils'
import { InjectionModule } from '@nodelith/injection'

export type InjectionGateway<T extends object> = Pick<T, {
  [K in keyof T]-?: T[K] extends (this: any, ...a: any[]) => any ? K : never
}[keyof T]>;

export function createInjectionGateway<T extends ConstructorUtils<any>>(constructor: T, module: InjectionModule): InjectionGateway<InstanceType<T>> {
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
  }, {} as InjectionGateway<InstanceType<T>>))
}

export const InjectionGateway = Object.freeze({
  create: createInjectionGateway,
});
