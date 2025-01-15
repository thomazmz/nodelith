import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import {
  Mode,
  Access,
  Lifetime,
  StaticOptions,
  FactoryOptions, 
  FunctionOptions, 
  ConstructorOptions,
} from '../options'

import { Token } from '../token'
import { Container } from '../container'
import { Registration }  from '../registration'
import { StaticRegistration } from '../registration/static-registration'
import { FactoryRegistration } from '../registration/factory-registration'
import { FunctionRegistration } from '../registration/function-registration'
import { ConstructorRegistration } from '../registration/constructor-registration'

export class Module {

  public static readonly DEFAULT_MODE: Mode = 'spread'
  public static readonly DEFAULT_ACCESS: Access = 'public'
  public static readonly DEFAULT_LIFETIME: Lifetime = 'transient'

  private readonly mode: Mode
  private readonly access: Access
  private readonly lifetime: Lifetime
  
  protected readonly publicContainer = new Container()
  protected readonly privateContainer = new Container()

  public constructor(options?: {
    mode: Mode,
    access: Access,
    lifetime: Lifetime,
  }) {
    this.mode = options?.mode ?? Module.DEFAULT_MODE
    this.access = options?.access ?? Module.DEFAULT_ACCESS
    this.lifetime = options?.lifetime ?? Module.DEFAULT_LIFETIME
  }

  public has(token: Token): boolean {
    return this.publicContainer.has(token) || this.privateContainer.has(token)
  }

  public register<R>(
    token: Token,
    options: { static: R } & StaticOptions 
  ): Registration<R>

  public register<R extends ReturnType<Types.Factory>>(
    token: Token,
    options: FactoryOptions & { factory: Types.Factory<R> }
  ): Registration<R>

  public register<R extends ReturnType<Types.Function>>(
    token: Token, 
    options: FunctionOptions & { function: Types.Function<R> }
  ): Registration<R>

  public register<R extends InstanceType<Types.Constructor>>(
    token: Token, 
    options: ConstructorOptions & { constructor: Types.Constructor<R> }
  ): Registration<R>

  public register(token: Token, 
    options:
      | { static: any } & StaticOptions
      | { factory: Types.Factory } & FactoryOptions
      | { function: Types.Function } & FunctionOptions
      | { constructor: Types.Constructor } & ConstructorOptions
  ):  Registration {

    if('static' in options)  {
      return this.registerStatic(token, options.static, {
        access: options?.access,
      })
    }

    if('factory' in options) {
      if(typeof options.factory !== 'function') {
        throw new Error(`Could not register "${token.toString()}". Provided factory should be of type "function".`)
      }

      return this.registerFactory(token, options.factory, {
        mode: options?.mode,
        access: options?.access,
        lifetime: options?.lifetime,
      })
    }

    if('function' in options) {
      if(typeof options.function !== 'function') {
        throw new Error(`Could not register "${token.toString()}". Provided function should be of type "function".`)
      }

      return this.registerFunction(token, options.function, {
        mode: options?.mode,
        access: options?.access,
        lifetime: options?.lifetime,
      })
    }

    if('constructor' in options) {
      if(typeof options.constructor !== 'function') {
        throw new Error(`Could not register "${token.toString()}". Provided constructor should be of type "function".`)
      }

      return this.registerConstructor(token, options.constructor, {
        mode: options?.mode,
        access: options?.access,
        lifetime: options?.lifetime,
      })
    }

    throw new Error(`Could not register "${token.toString()}". Given options are missing a valid registration target.`)
  }

  public registerStatic<R>(
    token: Token, 
    resolution: R, 
    options?: StaticOptions
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete static registration. Module already contain a registration under "${token.toString()}".`)
    }


    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete static registration. Invalid access option.')
    }

    const registration = new StaticRegistration(resolution, { 
      token: token ?? Symbol(),
    })

    if(options?.access ?? this.access === 'private') {
      this.privateContainer.push(registration)
    }

    if(options?.access ?? this.access === 'public') {
      this.privateContainer.push(registration)
    }

    return registration
  }

  public registerFactory<R extends ReturnType<Types.Factory>>(
    token: Token,
    factoryTarget: Types.Factory<R>,
    options?: FactoryOptions,
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete factory registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete factory registration. Invalid access option.')
    }

    const registration = new FactoryRegistration(factoryTarget, { 
      token: token ?? Symbol(),
      mode: options?.mode ?? this.mode,
      lifetime: options?.lifetime ?? this.lifetime,
    })

    if(options?.access ?? this.access === 'private') {
      this.privateContainer.push(registration)
    }

    if(options?.access ?? this.access === 'public') {
      this.privateContainer.push(registration)
    }

    return registration
  }

  public registerFunction<R extends ReturnType<Types.Function>>(
    token: Token,
    target: Types.Function<R>,
    options?: FunctionOptions,
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete function registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete function registration. Invalid access option.')
    }

    const registration = new FunctionRegistration(target, { 
      token: token ?? Symbol(),
      mode: options?.mode ?? this.mode,
      lifetime: options?.lifetime ?? this.lifetime,
    })

    if(options?.access ?? this.access === 'private') {
      this.privateContainer.push(registration)
    }

    if(options?.access ?? this.access === 'public') {
      this.privateContainer.push(registration)
    }

    return registration
  }

  public registerConstructor<R extends InstanceType<Types.Constructor>>(
    token: Token,
    constructor: Types.Constructor<R>,
    options?: ConstructorOptions,
  ): Registration<R> {

    if(this.has(token)) {
      throw new Error(`Could not complete constructor registration. Module already contain a registration under "${token.toString()}".`)
    }

    if(!Access.includes(options?.access ?? this.access)) {
      throw new Error('Could not complete constructor registration. Invalid access option.')
    }

    const registration = new ConstructorRegistration(constructor, { 
      token: token ?? Symbol(),
      mode: options?.mode ?? this.mode,
      lifetime: options?.lifetime ?? this.lifetime,
    })

    if(options?.access ?? this.access === 'private') {
      this.privateContainer.push(registration)
    }

    if(options?.access ?? this.access === 'public') {
      this.privateContainer.push(registration)
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

  public resolve<R extends ReturnType<Types.Function>>(token: Token): Registration<R> {
    throw new Error('Method not implemented.')
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
