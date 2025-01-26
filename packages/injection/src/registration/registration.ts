import * as Types from '@nodelith/types'

import { Mode } from '../mode'
import { Token } from'../token'
import { Access } from'../access'
import { Bundle } from '../bundle'
import { Lifetime } from '../lifetime'

import { StaticRegistration, StaticRegistrationOptions } from './static-registration'
import { FactoryRegistration, FactoryRegistrationOptions } from './factory-registration'
import { FunctionRegistration, FunctionRegistrationOptions } from './function-registration'
import { ConstructorRegistration, ConstructorRegistrationOptions } from './constructor-registration'

export abstract class Registration<R = any> {

  abstract readonly mode?: Mode
  
  abstract readonly lifetime?: Lifetime

  abstract readonly token: Token

  abstract readonly resolve: (bundle?: Bundle) => R

  abstract readonly clone: (bundle?: Bundle) => Registration<R>

  public static readonly DEFAULT_MODE: Mode = 'spread' as const

  public static readonly DEFAULT_ACCESS: Access = 'public' as const

  public static readonly DEFAULT_LIFETIME: Lifetime = 'singleton' as const

  public static create<R  = any >(
    options: StaticRegistrationOptions & { static: R }
  ): Registration<R>

  public static create<R extends ReturnType<Types.Factory>>(
    options: FactoryRegistrationOptions & { factory: Types.Factory<R> }
  ): Registration<R>

  public static create<R extends ReturnType<Types.Function>>(
    options: FunctionRegistrationOptions & { function: Types.Function<R> }
  ): Registration<R>

  public static create<R extends InstanceType<Types.Constructor>>(
    options: ConstructorRegistrationOptions & { constructor: Types.Constructor<R> }
  ): Registration<R>

  public static create<R extends InstanceType<Types.Constructor>>(
    options: 
      | ConstructorRegistrationOptions & { constructor: Types.Constructor<R> }
      | FactoryRegistrationOptions & { factory: Types.Factory<R> }
  ): Registration<R>

  public static create(
    options:
      | { static: any } & StaticRegistrationOptions
      | { factory: Types.Factory } & FactoryRegistrationOptions
      | { function: Types.Function } & FunctionRegistrationOptions
      | { constructor: Types.Constructor } & ConstructorRegistrationOptions
  ):  Registration {

    if('static' in options)  {
      return StaticRegistration.create(options)
    }

    if('factory' in options) {
      if(typeof options.factory !== 'function') {
        throw new Error(`Could create registration. Provided factory parameter is not a function.`)
      }

      return FactoryRegistration.create(options)
    }

    if('function' in options) {
      if(typeof options.function !== 'function') {
        throw new Error(`Could create registration. Provided function parameter is not a function.`)
      }

      return FunctionRegistration.create(options)
    }

    if('constructor' in options) {
      if(typeof options.constructor !== 'function') {
        throw new Error(`Could create registration. Provided constructor parameter should be of type 'function'.`)
      }

      return ConstructorRegistration.create(options)
    }

    throw new Error(`Could not create registration'. Options are missing a valid registration target.`)
  }
}
