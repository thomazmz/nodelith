import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import { Mode } from '../mode'
import { Token } from '../token'
import { Options } from '../options' 
import { Lifetime } from '../lifetime'
import { Container } from '../container'
import { Registration }  from '../registration'
import { StaticRegistration } from '../registration/static-registration'
import { FactoryRegistration } from '../registration/factory-registration'
import { ResolverRegistration } from '../registration/resolver-registration'
import { ConstructorRegistration } from '../registration/constructor-registration'

export class Module {

  public static readonly DEFAULT_MODE: Mode = 'spread'
  public static readonly DEFAULT_LIFETIME: Lifetime = 'transient'

  private readonly mode: Mode
  private readonly lifetime: Lifetime
  
  protected readonly container = new Container()

  public constructor(options?: Options) {
    this.mode = options?.mode ?? Module.DEFAULT_MODE
    this.lifetime = options?.lifetime ?? Module.DEFAULT_LIFETIME
  }

  public register<R>(token: Token, options: {
    static: R
  }): Registration<R>

  public register<R extends InstanceType<Types.Constructor>>(token: Token, options: Options & {
    constructor: Types.Constructor<R>,
  }): Registration<R>

  public register<R extends ReturnType<Types.Factory>>(token: Token, options: Options & {
    factory: Types.Factory<R>
  }): Registration<R>

  public register<R extends ReturnType<Types.Resolver>>(token: Token, options: Options & {
    resolver: Types.Resolver<R>,
  }): Registration<R>

  public register(token: Token, options:
    | { static: any }
    | { factory: Types.Factory } & Options
    | { resolver: Types.Resolver } & Options
    | { constructor: Types.Constructor } & Options
  ):  Registration {
    if('static' in options)  {
      return this.registerStatic(token, options.static)
    }

    if('factory' in options) {
      return this.registerFactory(token, options.factory, {
        mode: options?.mode,
        lifetime: options?.lifetime,
      })
    }

    if('resolver' in options) {
      return this.registerResolver(token, options.resolver, {
        mode: options?.mode,
        lifetime: options?.lifetime,
      })
    }

    if('constructor' in options) {
      return this.registerConstructor(token, options.constructor, {
        mode: options?.mode,
        lifetime: options?.lifetime,
      })
    }

    throw new Error(`Could not register ${token.toString()}. Given options are missing a valid registration target.`)
  }

  public registerStatic<R>(token: Token, resolution: R): Registration<R> {
    if(this.container.has(token)) {
      throw new Error(`Could not complete static registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new StaticRegistration(resolution, { 
      token: token ?? Symbol(),
    })

    this.container.push(registration)
    return registration
  }

  public registerConstructor<R extends InstanceType<Types.Constructor>>(token: Token, constructor: Types.Constructor<R>, options?: Options): Registration<R> {
    if(this.container.has(token)) {
      throw new Error(`Could not complete constructor registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new ConstructorRegistration(constructor, { 
      token: token ?? Symbol(),
      mode: options?.mode ?? this.mode,
      lifetime: options?.lifetime ?? this.lifetime,
    })

    this.container.push(registration)
    return registration
  }

  public registerFactory<R extends ReturnType<Types.Factory>>(token: Token, factory: Types.Factory<R>, options?: Options): Registration<R> {
    if(this.container.has(token)) {
      throw new Error(`Could not complete factory registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new FactoryRegistration(factory, { 
      token: token ?? Symbol(),
      mode: options?.mode ?? this.mode,
      lifetime: options?.lifetime ?? this.lifetime,
    })

    this.container.push(registration)
    return registration
  }

  public registerResolver<R extends ReturnType<Types.Resolver>>(token: Token, resolver: Types.Resolver<R>, options?: Options): Registration<R> {
    if(this.container.has(token)) {
      throw new Error(`Could not complete resolver registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new ResolverRegistration(resolver, { 
      token: token ?? Symbol(),
      mode: options?.mode ?? this.mode,
      lifetime: options?.lifetime ?? this.lifetime,
    })

    this.container.push(registration)
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

  public registerInitializerConstructor<I extends Core.Initializer>(token: Token, constructor: Types.Constructor<I>, options?: {
    mode?: Mode,
  }): Registration<I> {
    throw new Error('Method not implemented.')
  }

  public registerInitializerFactory<I extends Core.Initializer>(token: Token, factory: Types.Factory<I>, options?: {
    mode?: Mode,
  }): Registration<I> {
    throw new Error('Method not implemented.')
  }

  public resolve<R extends ReturnType<Types.Resolver>>(resolver: Types.Resolver<R>, options?: {
    mode?: Mode,
  }): Registration<R> {
    throw new Error('Method not implemented.')
  }

  public resolveConstructor<R extends InstanceType<Types.Constructor>>(constructor: Types.Constructor<R>, options?: {
    mode?: Mode,
  }): Registration<R> {
    throw new Error('Method not implemented.')
  }

  public resolveFactory<R extends ReturnType<Types.Factory>>(factory: Types.Factory<R>, options?: {
    mode?: Mode,
  }): Registration<R> {
    throw new Error('Method not implemented.')
  }
}
