import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import { Mode }  from '../mode'
import { Token } from '../token'
import { Bundle } from '../bundle'
import { Access } from '../access'
import { Lifetime } from '../lifetime'
import { Container } from '../container'

import { InitializerRegistrationOptions, Registration} from '../registration'
import { InitializerRegistration } from '../registration'
import { StaticRegistrationOptions} from '../registration'
import { FactoryRegistrationOptions} from '../registration'
import { FunctionRegistrationOptions} from '../registration'
import { ConstructorRegistrationOptions} from '../registration'

export class Module {

  public static readonly DEFAULT_ACCESS: Access  = 'public' as const

  private readonly mode: Mode
  private readonly access: Access
  private readonly lifetime: Lifetime

  protected readonly container = new Container()

  public constructor(options?: {
    mode: Mode,
    access: Access,
    lifetime: Lifetime,
  }) {
    this.mode = options?.mode ?? Registration.DEFAULT_MODE
    this.access = options?.access ?? Module.DEFAULT_ACCESS
    this.lifetime = options?.lifetime ?? Registration.DEFAULT_LIFETIME
  }

  public useModule(module: Module): void {
    for (const registration of module.container.unpack()) {
      this.useRegistration(registration)
    }
  }

  public useRegistration(registration: Registration): void {
    if(this.has(registration.token)) {
      throw new Error(`Could not complete registration. Module already contain a registration under "${registration.token.toString()}" token.`)
    }

    this.container.push(registration)
  }

  public has(token: Token): boolean {
    return this.container.has(token)
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
      | { constructor: Types.Constructor } & Omit<ConstructorRegistrationOptions, 'token'>
  ):  Registration {

    if('static' in options)  {
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

    throw new Error(`Could not register "${token.toString()}". Options are missing a valid registration target.`)
  }

  public registerStatic<R>(
    token: Token, 
    target: R, 
    options?: Omit<StaticRegistrationOptions, 'token'>
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete static registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete static registration. Invalid access option.')
    }

    const registration = Registration.create({ ...options,
      static: target,
      token,
    })

    this.container.push(registration)

    return registration
  }

  public registerFactory<R extends ReturnType<Types.Factory>>(
    token: Token,
    target: Types.Factory<R>,
    options?: Omit<FactoryRegistrationOptions, 'token'>
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete factory registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete factory registration. Invalid access option.')
    }

    const registration = Registration.create({ ...options,
      lifetime: options?.lifetime ?? this.lifetime,
      access: options?.access ?? this.access,
      mode: options?.mode ?? this.mode,
      factory: target,
      token,
    })

    this.container.push(registration)

    return registration
  }

  public registerFunction<R extends ReturnType<Types.Function>>(
    token: Token,
    target: Types.Function<R>,
    options?: Omit<FunctionRegistrationOptions, 'token'>
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete function registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete function registration. Invalid access option.')
    }

    const registration = Registration.create({ ...options,
      lifetime: options?.lifetime ?? this.lifetime,
      access: options?.access ?? this.access,
      mode: options?.mode ?? this.mode,
      function: target,
      token,
    })

    this.container.push(registration)

    return registration
  }

  public registerConstructor<R extends InstanceType<Types.Constructor>>(
    token: Token,
    target: Types.Constructor<R>,
    options?: Omit<ConstructorRegistrationOptions, 'token'>
  ): Registration<R> {
    if(this.has(token)) {
      throw new Error(`Could not complete constructor registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete constructor registration. Invalid access option.')
    }

    const registration = Registration.create({ ...options,
      lifetime: options?.lifetime ?? this.lifetime,
      access: options?.access ?? this.access,
      mode: options?.mode ?? this.mode,
      constructor: target,
      token,
    })

    this.container.push(registration)

    return registration
  }

  public registerInitializer<R extends object>(token: Token, options: {
    factory: Types.Factory<Core.Initializer<R>>
    mode?: Mode,
  }): Registration<R>

  public registerInitializer<R extends object>(token: Token, options: {
    constructor: Types.Constructor<Core.Initializer<R>> 
    mode?: Mode,
  }): Registration<R>

  public registerInitializer<R extends object>(token: Token, options:
    | { factory: Types.Factory<Core.Initializer<R>>, mode?: Mode }
    | { constructor: Types.Constructor<Core.Initializer<R>>, mode?: Mode }
  ): Registration<R> {
    return InitializerRegistration.create<R>(options)
  }

  public registerInitializerConstructor<R extends object>(
    token: Token,
    constructor: Types.Constructor<Core.Initializer<R>>,
    options?: Omit<InitializerRegistrationOptions, 'token'> 
  ): Registration<R> {
    return InitializerRegistration.create({ ...options,
      access: options?.access ?? this.access,
      mode: options?.mode ?? this.mode,
      constructor,
      token,
    })
  }

  public registerInitializerFactory<R extends object>(
    token: Token,
    factory: Types.Factory<Core.Initializer<R>>,
    options?: Omit<InitializerRegistrationOptions, 'token'>
  ): Registration<R> {
    return InitializerRegistration.create({ ...options,
      access: options?.access ?? this.access,
      mode: options?.mode ?? this.mode,
      factory,
      token,
    })
  }

  public resolve<R = any>(token: Token): R | undefined {
    return this.container.resolve<R>(token);
  }

  public resolveFactory<R extends ReturnType<Types.Factory>>(
    target: Types.Factory<R>,
    options?: { 
      mode?: Mode
      bundle?: Bundle
    }
  ): R {
    return Registration.create({ 
      mode: options?.mode ?? this.mode,
      bundle: this.container.bundle,
      factory: target
    }).resolve(options?.bundle)
  }

  public resolveFunction<R extends ReturnType<Types.Function>>(
    target: Types.Function<R>,
    options?: { 
      mode?: Mode
      bundle?: Bundle
    }
  ): R {
    return Registration.create({ 
      mode: options?.mode ?? this.mode,
      bundle: this.container.bundle,
      function: target
    }).resolve(options?.bundle)
  }

  public resolveConstructor<R extends InstanceType<Types.Constructor>>(
    target: Types.Constructor<R>,
    options?: { 
      mode?: Mode
      bundle?: Bundle
    }
  ): R {
    return Registration.create({ 
      mode: options?.mode ?? this.mode,
      bundle: this.container.bundle,
      constructor: target
    }).resolve(options?.bundle)
  }
}
