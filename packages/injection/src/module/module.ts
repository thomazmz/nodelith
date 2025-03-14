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

export class Module implements Core.Initializer {

  private readonly container: Container = new Container()

  private readonly modules: Set<Module> = new Set()

  public readonly bundle: Bundle = {}

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
      this.container.useRegistration(registration)
    })

    this.modules.add(module)
  }

  public async initialize(): Promise<void> {
    for (const module of this.modules) {
      await module.initialize()
    }

    const initializers = this.registrations.filter(registration => {
      return InitializableRegistration.isInitializable(registration)
    })

    for (const initializer of initializers) {
      await initializer.initialize()
    }
  }

  public async terminate(): Promise<void> {
    for (const module of this.modules) {
      await module.terminate()
    }

    const initializers = this.registrations.filter(registration => {
      return InitializableRegistration.isInitializable(registration)
    })

    for (const initializer of initializers) {
      initializer.terminate()
    }
  }

  public register<R>(
    token: Token,
    options: Omit<StaticRegistrationOptions, 'token' | 'bundle'> & { static: any }
  ): Registration<R>

  public register<R extends object>(
    token: Token,
    options: Omit<FactoryRegistrationOptions, 'token' | 'bundle'> & { factory: Types.Factory<R> }
  ): Registration<R>

  public register<R extends ReturnType<Types.Function>>(
    token: Token, 
    options: Omit<FunctionRegistrationOptions, 'token' | 'bundle'> & { function: Types.Function<R> } 
  ): Registration<R>

  public register<R extends object>(
    token: Token, 
    options: Omit<ConstructorRegistrationOptions, 'token' | 'bundle'> & { constructor: Types.Constructor<R> }
  ): Registration<R>

  public register(token: Token, 
    options:
      | { static: any } & Omit<StaticRegistrationOptions, 'token' | 'bundle'>
      | { factory: Types.Factory } & Omit<FactoryRegistrationOptions, 'token' | 'bundle'>
      | { function: Types.Function } & Omit<FunctionRegistrationOptions, 'token' | 'bundle'>
      | { constructor: Types.Constructor } & Omit<FactoryRegistrationOptions, 'token' | 'bundle'>
  ): Registration {

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
        token,
      }))
    }

    if('function' in options) {
      return this.setRegistration(FunctionRegistration.create(options.function, {
        lifetime: options?.lifetime,
        access: options?.access,
        token,
      }))
    }

    if('constructor' in options) {
      return this.setRegistration(ConstructorRegistration.create(options.constructor, {
        lifetime: options?.lifetime,
        access: options?.access,
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
      return this.container.resolve(options.token)
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
      | { constructor: Types.Constructor<Core.Initializer> } & Omit<ConstructorRegistrationOptions, 'token'>
  ): Registration {

    if('factory' in options) {
      return this.setRegistration(InitializableRegistration.create(
        FactoryRegistration.create(options.factory, {
          bundle: options.bundle,
          token,
        })
      ))
    }

    if('constructor' in options) {
      return this.setRegistration(InitializableRegistration.create(
        ConstructorRegistration.create(options.constructor, {
          bundle: options.bundle,
          token,
        })
      ))
    }

    throw new Error(`Could not resolve.`)
  }

  private setRegistration<R>(registration: Registration<R>): Registration<R> {
    if(this.container.has(registration.token)) {
      throw new Error('TODO')
    }

    const containerRegistration = this.container.setRegistration<R>(registration)

    if(containerRegistration.access === 'public') {
      Object.defineProperty(this.bundle, registration.token, {
        get: () => registration.resolve(),
        configurable: true,
        enumerable: true,
      })
    }

    return registration
  }
}