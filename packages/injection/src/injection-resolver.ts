import { ConstructorType } from '@nodelith/utilities'
import { FunctionType } from '@nodelith/utilities'
import { FactoryType } from '@nodelith/utilities'
import { Identity } from '@nodelith/identity'

export function createResolverProxy<T extends object = any>(resolver: FunctionType<T>, prototype?: object): FunctionType<T> {
  return Identity.bind(resolver, (...args: any[]) => {
    const getResolution = ((resolution?: { value: any }) => () => {
      return resolution ? resolution : resolution = {
        value: resolver(...args)
      }
    })()

    return new Proxy<T>(Object.create(prototype ?? null), {
      get(_target, property, receiver) {
        const resolution = getResolution()
        return Reflect.get(resolution.value, property, receiver)
      },
      set(_target, property, value, receiver) {
        const resolution = getResolution()
        return Reflect.set(resolution.value, property, value, receiver)
      },
      has(_target, property) {
        const resolution = getResolution()
        return Reflect.has(resolution.value, property)
      },
      apply(_target, thisArg, argumentsList) {
        const resolution = getResolution()
        return Reflect.apply(resolution.value, thisArg, argumentsList)
      },
      ownKeys(_target) {
        const resolution = getResolution()
        return Reflect.ownKeys(resolution.value)
      },
      getPrototypeOf(_target) {
        const resolution = getResolution()
        return Reflect.getPrototypeOf(resolution.value)
      },
      getOwnPropertyDescriptor(_target, property) {
        const resolution = getResolution()
        return Reflect.getOwnPropertyDescriptor(resolution.value, property)
      },
    })
  })
}

export function createClassResolver<T extends object>(target: ConstructorType<T>): InjectionResolver<T> {
  const classResolver = Identity.bind(target, (...args: any[]) => new target(...args))
  return createResolverProxy(classResolver, target)
}

export function createFactoryResolver<T extends object>(target: FactoryType<T>): InjectionResolver<T> {
  const factoryResolver = Identity.bind(target, (...args: any[]) => target(...args))
  return createResolverProxy(factoryResolver, target)
}

export function createFunctionResolver<T>(target: FunctionType<T>): InjectionResolver<T> {
  return Identity.bind(target, (...args: any[]) => target(...args))
}

export function createValueResolver<T>(target: T): InjectionResolver<T> {
  return (..._args: any[]) => target
}

export type InjectionResolver<T = any, A extends any[] = any[]> = (...args: A) => T

export const InjectionResolver = Object.freeze({
  createFunctionResolver,
  createFactoryResolver,
  createValueResolver,
  createClassResolver,
})
