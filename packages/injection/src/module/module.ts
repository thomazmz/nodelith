import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import { Mode } from '../mode'
import { Token } from '../token'
import { Options } from '../options' 
import { Registration } from '../registration'

export class Module {

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

  public register<R>(token: Token, options:
    | { static: R }
    | { factory: Types.Factory } & Options
    | { resolver: Types.Resolver } & Options
    | { constructor: Types.Constructor } & Options
  ):  Registration<R> {
    throw new Error('Method not implemented.')
  }

  public registerStatic<R>(token: Token, resolution: R): Registration<R> {
    throw new Error('Method not implemented')
  }

  public registerConstructor<R extends InstanceType<Types.Constructor>>(token: Token, constructor: Types.Constructor<R>, options?: Options): Registration<R> {
    throw new Error('Method not implemented')
  }

  public registerFactory<R extends ReturnType<Types.Factory>>(token: Token, factory: Types.Factory<R>, options?: Options): Registration<R> {
    throw new Error('Method not implemented')
  }

  public registerResolver<R extends ReturnType<Types.Resolver>>(token: Token, resolver: Types.Resolver<R>, options?: Options): Registration<R> {
    throw new Error('Method not implemented')
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
