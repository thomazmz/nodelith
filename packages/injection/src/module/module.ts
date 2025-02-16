import * as Types from '@nodelith/types'
import * as Core from '@nodelith/core'

import { ConstructorRegistrationOptions } from '../registration'
import { FunctionRegistrationOptions } from '../registration'
import { FactoryRegistrationOptions } from '../registration'
import { StaticRegistrationOptions } from '../registration'
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

  private readonly downstreamBundle: Bundle = {}

  private readonly upstreamBundle: Bundle = {}

  private readonly modules: Module[] = []

  private readonly container: Container

  public constructor(options?: ModuleOptions)  {
    this.container = options?.container ?? new Container()
    this.container.registrations.forEach((registration) => {
      this.setRegistration(registration)
    })
  }

  public exposes(token: Token): boolean {
    return token in this.upstreamBundle
  }

  public clone(bundle?: Bundle): Module {
    const container = this.container.clone(bundle)
    const module = new Module({ container })
    module.extend(...this.modules)
    return module
  }

  public resolve<R = any>(token: Token): R | undefined {
    return this.exposes(token) ? this.container.resolve<R>(token) : undefined
  }

  public extend(modules: Module): Module

  public extend(...modules: Module[]): Module[]

  public extend(...modules: Module[]): Module | Module[] {
    if(modules.length > 1)  {
      return modules.map(externalRegistration => {
        return this.extend(externalRegistration)
      })
    }

    if(!modules[0]) {
      return []
    }

    const module = modules[0].clone(this.downstreamBundle)
    this.useBundle(module.upstreamBundle)
    this.modules.push(module)
    return module
  }

  public register<R>(
    token: Token,
    options: Omit<StaticRegistrationOptions, 'token'> & { static: any }
  ): Registration<R>

  public register<R extends ReturnType<Types.Factory>>(
    token: Token,
    options: Omit<FactoryRegistrationOptions, 'token'> & { factory: Types.Factory }
  ): Registration<R>

  public register<R extends ReturnType<Types.Function>>(
    token: Token, 
    options: Omit<FunctionRegistrationOptions, 'token'> & { function: Types.Function } 
  ): Registration<R>

  public register<R extends InstanceType<Types.Constructor>>(
    token: Token, 
    options: Omit<ConstructorRegistrationOptions, 'token'> & { constructor: Types.Constructor }
  ): Registration<R>

  public register(token: Token, 
    options:
      | { static: any } & Omit<StaticRegistrationOptions, 'token'>
      | { factory: Types.Factory } & Omit<FactoryRegistrationOptions, 'token'>
      | { function: Types.Function } & Omit<FunctionRegistrationOptions, 'token'>
      | { constructor: Types.Constructor } & Omit<FactoryRegistrationOptions, 'token'>
  ):  Registration {

    if('static' in options) {
      return this.registerStatic(token, options.static, options)
    }

    if('factory' in options) {
      return this.registerFactory(token, options.factory, options)
    }

    if('function' in options) {
      return this.registerFunction(token, options.function, options)
    }

    if('constructor' in options) {
      return this.registerConstructor(token, options.constructor, options)
    }

    throw new Error(`Could not register "${token.toString()}". Given options are missing a valid registration target.`)
  }

  public registerStatic<R>(
    token: Token,
    target: R,
    options: Omit<StaticRegistrationOptions, 'token'>,
  ): Registration<R> {
    return this.setRegistration(StaticRegistration.create(target, {
      access: options?.access,
      token,
    }))
  }

  public registerFactory<R extends ReturnType<Types.Factory>>(
    token: Token,
    target: Types.Factory<R>,
    options?: Omit<FactoryRegistrationOptions, 'token'>
  ): Registration<R> {
    return this.setRegistration(FactoryRegistration.create(target, {
      lifetime: options?.lifetime,
      access: options?.access,
      bundle: options?.bundle,
      token,
    }))
  }

  public registerFunction<R extends ReturnType<Types.Function>>(
    token: Token,
    target: Types.Function<R>,
    options?: Omit<FunctionRegistrationOptions, 'token'>,
  ): Registration<R> {
    return this.setRegistration(FunctionRegistration.create(target, {
      lifetime: options?.lifetime,
      access: options?.access,
      bundle: options?.bundle,
      token,
    }))
  }

  public registerConstructor<R extends InstanceType<Types.Constructor>>(
    token: Token,
    target: Types.Constructor<R>,
    options?: Omit<ConstructorRegistrationOptions, 'token'>,
  ): Registration<R> {
    return this.setRegistration(ConstructorRegistration.create(target, {
      lifetime: options?.lifetime,
      access: options?.access,
      bundle: options?.bundle,
      token,
    }))
  }

  public registerInitializerConstructor<I extends Core.Initializer>(token: Token, target: Types.Constructor<I>): Registration<I> {
    throw new Error('Method Module.registerInitializerConstructor is not Implemented.')
  }

  public registerInitializerFactory<I extends Core.Initializer>(token: Token, target: Types.Factory<I>): Registration<I> {
    throw new Error('Method Module.registerInitializerFactory is not Implemented.')
  }

  public resolveFactory<R extends ReturnType<Types.Factory>>(target: Types.Factory<R>): R {
    throw new Error('Method Module.resolveFactory is not Implemented.')
  }

  public resolveFunction<R extends ReturnType<Types.Function>>(target: Types.Function<R>): R {
    throw new Error('Method Module.resolveFunction is not Implemented.')
  }

  public resolveConstructor<R extends InstanceType<Types.Constructor>>(target: Types.Constructor<R>): R {
    throw new Error('Method Module.resolveConstructor is not Implemented.')
  }

  private useBundle(bundle: Bundle): void {
    const bundleDescriptors = Object.getOwnPropertyDescriptors(bundle)
    Object.defineProperties(this.container.bundle, Object.fromEntries(
      Object.entries(bundleDescriptors).filter(([token]) => {
        return !this.container.has(token)
      })
    ))
  }

  private setRegistration<R>(externalRegistration: Registration<R>): Registration<R> {
    const registration = this.container.register<R>(externalRegistration)
    const { token, access } = registration

    const registrationDescriptor = {
      get: () => this.container.resolve(token),
      configurable: true,
      enumerable: true,
    }

    if(!(token in this.upstreamBundle) && ['external', 'public'].includes(access)) {
      Object.defineProperty(this.upstreamBundle, token, registrationDescriptor)
    }

    if(!(token in this.downstreamBundle) && ['internal', 'public'].includes(access)) {
      Object.defineProperty(this.downstreamBundle, token, registrationDescriptor)
    }

    return registration
  }
}