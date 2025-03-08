import * as Types from '@nodelith/types'
import * as Core from '@nodelith/core'

import { ConstructorRegistrationOptions } from '../registration'
import { FunctionRegistrationOptions } from '../registration'
import { FactoryRegistrationOptions } from '../registration'
import { StaticRegistrationOptions } from '../registration'
import { InitializableRegistration} from '../registration'
import { ConstructorRegistration } from '../registration'
import { FunctionRegistration } from '../registration'
import { FactoryRegistration } from '../registration'
import { StaticRegistration } from '../registration'
import { Registration } from '../registration'
import { Container } from '../container'
import { Bundle } from '../bundle'
import { Token } from '../token'

type ModuleOptions = {
  container?: Container | undefined
}

export class Module {

  private readonly bundle: Bundle = {}

  private readonly container: Container = new Container()

  public constructor(options?: ModuleOptions)  {
    this.container = options?.container ?? new Container()
    this.container.registrations.forEach((registration) => {
      this.setRegistration(registration)
    })
  }

  public get registrations() {
    return this.container.registrations.filter(registration => {
      return registration.access === 'public'
    })
  }

  public exposes(token: Token): boolean {
    return token in this.bundle
  }

  public import(module: Module): void {
    module.registrations.forEach(registration => {
      this.container.register(registration)
    })
  }

  public register<R>(
    token: Token,
    options: Omit<StaticRegistrationOptions, 'token'> & { static: any }
  ): Registration<R>

  public register<R extends object>(
    token: Token,
    options: Omit<FactoryRegistrationOptions, 'token'> & { factory: Types.Factory<R> }
  ): Registration<R>

  public register<R extends ReturnType<Types.Function>>(
    token: Token, 
    options: Omit<FunctionRegistrationOptions, 'token'> & { function: Types.Function<R> } 
  ): Registration<R>

  public register<R extends object>(
    token: Token, 
    options: Omit<ConstructorRegistrationOptions, 'token'> & { constructor: Types.Constructor<R> }
  ): Registration<R>

  public register(token: Token, 
    options:
      | { static: any } & Omit<StaticRegistrationOptions, 'token'>
      | { factory: Types.Factory } & Omit<FactoryRegistrationOptions, 'token'>
      | { function: Types.Function } & Omit<FunctionRegistrationOptions, 'token'>
      | { constructor: Types.Constructor } & Omit<FactoryRegistrationOptions, 'token'>
  ):  Registration {

    if('static' in options) {
      return this.setRegistration(StaticRegistration.create(options.static, {
        access: options?.access,
        token,
      }))
    }

    if('factory' in options) {
      return this.setRegistration(FactoryRegistration.create(options.factory, {
        lifetime: options?.lifetime,
        access: options?.access,
        bundle: options?.bundle,
        token,
      }))
    }

    if('function' in options) {
      return this.setRegistration(FunctionRegistration.create(options.function, {
        lifetime: options?.lifetime,
        access: options?.access,
        bundle: options?.bundle,
        token,
      }))
    }

    if('constructor' in options) {
      return this.setRegistration(ConstructorRegistration.create(options.constructor, {
        lifetime: options?.lifetime,
        access: options?.access,
        bundle: options?.bundle,
        token,
      }))
    }

    throw new Error(`Could not register "${token.toString()}". Given options are missing a valid registration target.`)
  }

  public resolve<R = any>(options: { token: Token }): R

  public resolve<R = any>(options: { factory: Types.Function<R> }): R

  public resolve<R extends object = object>(options: { factory: Types.Factory<R> }): R
  
  public resolve<R extends object = object>(options: { constructor: Types.Constructor<R> }): R

  public resolve(options:
    | { token: Token }
    | { factory: Types.Factory }
    | { function: Types.Function }
    | { constructor: Types.Constructor }
  ) {

    if('token' in options) {
      return this.bundle[options.token]
    }

    if('factory' in options) {
      return FactoryRegistration.create(options.factory, {
        bundle: this.bundle
      }).resolve()
    }

    if('function' in options) {
      return FunctionRegistration.create(options.function, {
        bundle: this.bundle
      }).resolve()
    }

    if('constructor' in options) {
      return ConstructorRegistration.create(options.constructor, {
        bundle: this.bundle
      }).resolve()
    }

    throw new Error(`Could not resolve.`)
  }

  public registerInitializer<R extends object>(
    token: Token,
    options: Omit<FactoryRegistrationOptions, 'token'> & { factory: Types.Factory<R> }
  ): Registration<R>

  public registerInitializer<R extends object>(
    token: Token, 
    options: Omit<ConstructorRegistrationOptions, 'token'> & { constructor: Types.Constructor<R> }
  ): Registration<R>

  public registerInitializer(token: Token, 
    options:
      | { factory: Types.Factory<Core.Initializer> } & Omit<FactoryRegistrationOptions, 'token'>
      | { constructor: Types.Constructor<Core.Initializer> } & Omit<FactoryRegistrationOptions, 'token'>
  ): Registration {

    if('factory' in options) {
      return this.setRegistration(InitializableRegistration.create(
        FactoryRegistration.create(options.factory, {
          bundle: this.bundle,
          token,
        })
      ))
    }

    if('constructor' in options) {
      return this.setRegistration(InitializableRegistration.create(
        ConstructorRegistration.create(options.constructor, {
          bundle: this.bundle,
          token,
        })
      ))
    }

    throw new Error(`Could not resolve.`)

  }

  // private useBundle(bundle: Bundle): void {
  //   const bundleDescriptors = Object.getOwnPropertyDescriptors(bundle)
  //   Object.defineProperties(this.container.bundle, Object.fromEntries(
  //     Object.entries(bundleDescriptors).filter(([token]) => {
  //       return !this.container.has(token)
  //     })
  //   ))
  // }

  private setRegistration<R>(externalRegistration: Registration<R>): Registration<R> {
    const registration = this.container.register<R>(externalRegistration)
    const { token, access } = registration

    if(!(token in this.bundle) && ['external', 'public'].includes(access)) {
      Object.defineProperty(this.bundle, token, {
        get: () => this.container.resolve(token),
        configurable: true,
        enumerable: true,
      })
    }

    return registration
  }
}