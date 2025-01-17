import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import { Mode }  from '../mode'
import { Access } from '../access'
import { Lifetime } from '../lifetime'

import { Token } from '../token'
import { Container } from '../container'
import { Registration }  from '../registration'
import { StaticRegistrationOptions }  from '../registration'
import { DynamicRegistrationOptions }  from '../registration'

export type StaticModuleRegistrationOptions = Partial<
  Omit<StaticRegistrationOptions, 'token'> & { access: Access }
>

export type DynamicModuleRegistrationOptions = Partial<
  Omit<DynamicRegistrationOptions, 'token'> & { access: Access }
>

export class Module {

  public static readonly DEFAULT_ACCESS: Access  = 'public' as const

  private readonly mode: Mode
  private readonly access: Access
  private readonly lifetime: Lifetime
  
  private readonly container = new Container()

  private readonly publicTokens: Token[] = []
  private readonly privateTokens: Token[] = []

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
    for (const registration of module.unpack()) {
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

  public unpack(): Registration[]
  public unpack(...tokens: Token[]): (Registration | undefined)[]
  public unpack(...tokens: Token[]): (Registration | undefined)[] {
    return this.container.unpack(...tokens.map(token => {
      return this.privateTokens.includes(token) ? Symbol() : token
    }))
  }

  public register<R>(
    token: Token,
    options: StaticModuleRegistrationOptions & { static: R } 
  ): Registration<R>

  public register<R extends ReturnType<Types.Factory>>(
    token: Token,
    options: DynamicModuleRegistrationOptions & { factory: Types.Factory<R> }
  ): Registration<R>

  public register<R extends ReturnType<Types.Function>>(
    token: Token, 
    options: DynamicModuleRegistrationOptions & { function: Types.Function<R> }
  ): Registration<R>

  public register<R extends InstanceType<Types.Constructor>>(
    token: Token, 
    options: DynamicModuleRegistrationOptions & { constructor: Types.Constructor<R> }
  ): Registration<R>

  public register(token: Token, 
    options:
      | { static: any } & StaticModuleRegistrationOptions
      | { factory: Types.Factory } & DynamicModuleRegistrationOptions
      | { function: Types.Function } & DynamicModuleRegistrationOptions
      | { constructor: Types.Constructor } & DynamicModuleRegistrationOptions
  ):  Registration {

    if('static' in options)  {
      return this.registerStatic(token, options.static, options)
    }

    if('factory' in options) {
      if(typeof options.factory !== 'function') {
        throw new Error(`Could not register "${token.toString()}". Provided factory should be of type "function".`)
      }

      return this.registerFactory(token, options.factory, options)
    }

    if('function' in options) {
      if(typeof options.function !== 'function') {
        throw new Error(`Could not register "${token.toString()}". Provided function should be of type "function".`)
      }

      return this.registerFunction(token, options.function, options)
    }

    if('constructor' in options) {
      if(typeof options.constructor !== 'function') {
        throw new Error(`Could not register "${token.toString()}". Provided constructor should be of type "function".`)
      }

      return this.registerConstructor(token, options.constructor, options)
    }

    throw new Error(`Could not register "${token.toString()}". Given options are missing a valid registration target.`)
  }

  public registerStatic<R>(
    token: Token, 
    target: R, 
    options?: StaticModuleRegistrationOptions
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

    if(options?.access ?? this.access === 'private') {
      this.privateTokens.push(registration.token)
    }

    if(options?.access ?? this.access === 'public') {
      this.publicTokens.push(registration.token)
    }

    return registration
  }

  public registerFactory<R extends ReturnType<Types.Factory>>(
    token: Token,
    target: Types.Factory<R>,
    options?: DynamicModuleRegistrationOptions,
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete factory registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete factory registration. Invalid access option.')
    }

    const registration = Registration.create({ ...options,
      lifetime: options?.lifetime ?? this.lifetime,
      mode: options?.mode ?? this.mode,
      factory: target,
      token,
    });

    this.container.push(registration)

    if(options?.access ?? this.access === 'private') {
      this.privateTokens.push(registration.token)
    }

    if(options?.access ?? this.access === 'public') {
      this.publicTokens.push(registration.token)
    }

    return registration
  }

  public registerFunction<R extends ReturnType<Types.Function>>(
    token: Token,
    target: Types.Function<R>,
    options?: DynamicModuleRegistrationOptions,
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete function registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete function registration. Invalid access option.')
    }

    const registration = Registration.create({ ...options,
      lifetime: options?.lifetime ?? this.lifetime,
      mode: options?.mode ?? this.mode,
      function: target,
      token,
    });

    this.container.push(registration)

    if(options?.access ?? this.access === 'private') {
      this.privateTokens.push(registration.token)
    }

    if(options?.access ?? this.access === 'public') {
      this.publicTokens.push(registration.token)
    }

    return registration
  }

  public registerConstructor<R extends InstanceType<Types.Constructor>>(
    token: Token,
    target: Types.Constructor<R>,
    options?: DynamicModuleRegistrationOptions,
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete constructor registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete constructor registration. Invalid access option.')
    }

    const registration = Registration.create({ ...options,
      lifetime: options?.lifetime ?? this.lifetime,
      mode: options?.mode ?? this.mode,
      constructor: target,
      token,
    });

    this.container.push(registration)

    if(options?.access ?? this.access === 'private') {
      this.privateTokens.push(registration.token)
    }

    if(options?.access ?? this.access === 'public') {
      this.publicTokens.push(registration.token)
    }

    return registration
  }

  public registerInitializer<I extends Core.Initializer>(token: Token, options: {
    factory: Types.Factory<I>
    mode?: Mode,
  }): Registration<I>

  public registerInitializer<I extends Core.Initializer>(token: Token, options: {
    constructor: Types.Constructor<I>
    mode?: Mode,
  }): Registration<I>

  public registerInitializer<I extends Core.Initializer>(token: Token, options:
    | { factory: Types.Factory<I>, mode?: Mode }
    | { constructor: Types.Constructor<I>, mode?: Mode }
  ): Registration<I> {
    throw new Error('Method not implemented.')
  }

  public registerInitializerConstructor<I extends Core.Initializer>(token: Token, target: Types.Constructor<I>, options?: {
    mode?: Mode,
  }): Registration<I> {
    throw new Error('Method not implemented.')
  }

  public registerInitializerFactory<I extends Core.Initializer>(token: Token, target: Types.Factory<I>, options?: {
    mode?: Mode,
  }): Registration<I> {
    throw new Error('Method not implemented.')
  }

  public resolve<R = any>(token: Token): R | undefined {
    return this.container.resolve<R>(token);
  }

  public resolveFactory<R extends ReturnType<Types.Factory>>(target: Types.Factory<R>, options?: {
    mode?: Mode,
  }): R {
    throw new Error('Method not implemented.')
  }

  public resolveFunction<R extends ReturnType<Types.Function>>(target: Types.Function<R>, options?: {
    mode?: Mode
  }): R {
    throw new Error('Method not implemented.')
  }

  public resolveConstructor<R extends InstanceType<Types.Constructor>>(target: Types.Constructor<R>, options?: {
    mode?: Mode,
  }): R {
    throw new Error('Method not implemented.')
  }
}
