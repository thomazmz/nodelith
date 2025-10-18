import { ObjectUtils } from '@nodelith/utils'
import { ConstructorUtils } from '@nodelith/utils'
import { InjectionModule } from '@nodelith/injection'
import { InjectionBundle } from '@nodelith/injection'

export type InjectionFacade<T extends object> = Pick<T, {
  [K in keyof T]-?: T[K] extends (this: any, ...a: any[]) => any ? K : never
}[keyof T]>;

export function createInjectionFacade<T extends ConstructorUtils>(module: InjectionModule, constructor: T, bundle?: InjectionBundle): InjectionFacade<InstanceType<T>> {
  return Object.freeze(ObjectUtils.extractMembers(constructor.prototype).reduce((gateway, member) => {
    if(ObjectUtils.isConstructorMember(member) || !ObjectUtils.isFunctionMember(member)) {
      return gateway
    }

    const operation = (...args: any[]) => {
      const instance = InjectionModule.resolve(module, { class: constructor, bundle })
      return instance[member.key].apply(instance, args)
    }

    return Object.defineProperty(gateway, member.key, {
      value: operation,
      configurable: false,
      enumerable: true,
      writable: false,
    })
  }, {} as InjectionFacade<InstanceType<T>>))
}

export const InjectionFacade = Object.freeze({
  create: createInjectionFacade,
});
