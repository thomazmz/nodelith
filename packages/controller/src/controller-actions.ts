import { UtilsConstructor } from '@nodelith/utils'
import { InjectionModule } from '@nodelith/injection'
import { UtilsObject } from '@nodelith/utils'

type ControllerActions<T> = Pick<T, { [K in keyof T]: T[K] extends Function ? K : never }[keyof T]>

export function extractControllerActions<T extends object>(constructor: UtilsConstructor<T>, module: InjectionModule): ControllerActions<T> {
  return Object.freeze(UtilsObject.extractMembers(constructor.prototype).reduce((controllerWrapper, member) => {
    if(UtilsObject.isConstructorMember(member) || !UtilsObject.isFunctionMember(member)) {
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
