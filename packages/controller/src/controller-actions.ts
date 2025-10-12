import { ConstructorUtils } from '@nodelith/utils'
import { ObjectUtils } from '@nodelith/utils'
import { InjectionModule } from '@nodelith/injection'

type ControllerActions<T> = Pick<T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>

export function extractControllerActions<T extends object>(constructor: ConstructorUtils<T>, module: InjectionModule): ControllerActions<T> {
  return Object.freeze(ObjectUtils.extractMembers(constructor.prototype).reduce((controllerWrapper, member) => {
    if(ObjectUtils.isConstructorMember(member) || !ObjectUtils.isFunctionMember(member)) {
      return controllerWrapper
    }

    const methodWrapper = (...args: any[]) => {
      const instance = InjectionModule.resolveClass(constructor, module)
      return instance[member.key].apply(instance, args)
    }

    return Object.defineProperty(controllerWrapper, member.key, {
      value: methodWrapper,
      configurable: false,
      enumerable: true,
      writable: false,
    })
  }, {} as ControllerActions<T>))
}

export const ControllerActions = Object.freeze({
  extract: extractControllerActions
})
