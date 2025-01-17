import * as Types from '@nodelith/types'

import { Mode } from '../mode'
import { Token } from'../token'
import { Bundle } from '../bundle'
import { Lifetime } from '../lifetime'
import { createStaticRegistration } from './create-static-registration'
import { createFactoryRegistration } from './create-factory-registration'
import { createFunctionRegistration } from './create-function-registration'
import { createConstructorRegistration } from './create-constructor-registration'

export type DynamicRegistrationOptions = {
  mode: Mode
  token: Token
  bundle: Bundle
  lifetime: Lifetime
}

export type StaticRegistrationOptions = {
  token: Token
}

export abstract class Registration<R = any> {

  public static readonly DEFAULT_MODE: Mode = 'spread' as const

  public static readonly DEFAULT_LIFETIME: Lifetime = 'singleton' as const

  public static create<R  = any >(
    options: Partial<StaticRegistrationOptions> & { static: R }
  ): Registration<R>

  public static create<R extends ReturnType<Types.Factory>>(
    options: Partial<DynamicRegistrationOptions> & { factory: Types.Factory<R> }
  ): Registration<R>

  public static create<R extends ReturnType<Types.Function>>(
    options: Partial<DynamicRegistrationOptions> & { function: Types.Function<R> }
  ): Registration<R>

  public static create<R extends InstanceType<Types.Constructor>>(
    options: Partial<DynamicRegistrationOptions> & { constructor: Types.Constructor<R> }
  ): Registration<R>

  public static create(
    options:
      | { static: any } & Partial<StaticRegistrationOptions>
      | { factory: Types.Factory } & Partial<DynamicRegistrationOptions>
      | { function: Types.Function } & Partial<DynamicRegistrationOptions>
      | { constructor: Types.Constructor } & Partial<DynamicRegistrationOptions>
  ):  Registration {

    if('static' in options)  {
      return createStaticRegistration(options.static, Registration.resolveStaticOptions(options))
    }

    if('factory' in options) {
      if(typeof options.factory !== 'function') {
        throw new Error(`Could create registration. Provided factory parameter is not a function.`)
      }

      return createFactoryRegistration(options.factory, Registration.resolveDynamicOptions(options))
    }

    if('function' in options) {
      if(typeof options.function !== 'function') {
        throw new Error(`Could create registration. Provided function parameter is not a function.`)
      }

      return createFunctionRegistration(options.function, Registration.resolveDynamicOptions(options))
    }

    if('constructor' in options) {
      if(typeof options.constructor !== 'function') {
        throw new Error(`Could create registration. Provided constructor parameter should be of type "function".`)
      }

      return createConstructorRegistration(options.constructor, Registration.resolveDynamicOptions(options))
    }

    throw new Error(`Could not create registration". Options are missing a valid registration target.`)
  }

  private static resolveStaticOptions(
    options: Partial<StaticRegistrationOptions>
  ): StaticRegistrationOptions {
    return {
      token: options?.token ?? Symbol(),
    }
  }

  private static resolveDynamicOptions(
    options: Partial<DynamicRegistrationOptions>
  ): DynamicRegistrationOptions {
    return {
      bundle: options?.bundle ?? {},
      token: options?.token ?? Symbol(),
      mode: options?.mode ?? Registration.DEFAULT_MODE,
      lifetime: options?.lifetime ?? Registration.DEFAULT_LIFETIME,
    }
  }

  abstract readonly token: Token

  abstract readonly resolve: (bundle?: Bundle) => R

  abstract readonly clone: (bundle?: Bundle) => Registration<R>
}
