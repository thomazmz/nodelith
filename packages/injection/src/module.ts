import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import { Mode } from './mode'
import { Token } from './token'
import { Options } from './options' 
import { Registration } from './registration'

export interface Module {

  registerStatic<R>(token: Token, resolution: R): Registration<R>

  registerConstructor<R extends InstanceType<Types.Constructor>>(token: Token, constructor: Types.Constructor<R>, options?: Options): Registration<R>

  registerFactory<R extends ReturnType<Types.Factory>>(token: Token, factory: Types.Factory<R>, options?: Options): Registration<R>

  registerResolver<R extends ReturnType<Types.Resolver>>(token: Token, resolver: Types.Resolver<R>, options?: Options): Registration<R>

  register<R>(token: Token, options: {
    static: R
  }): Registration<R>

  register<R extends InstanceType<Types.Constructor>>(token: Token, options: Options & {
    constructor: Types.Constructor<R>,
  }): Registration<R>

  register<R extends ReturnType<Types.Factory>>(token: Token, options: Options & {
    factory: Types.Factory<R>
  }): Registration<R>

  register<R extends ReturnType<Types.Resolver>>(token: Token, options: Options & {
    resolver: Types.Resolver<R>,
  }): Registration<R>

  registerInitializer<I extends Core.Initializer>(token: Token, options: {
    factory: Types.Factory<I>
    mode?: Mode,
  }): Registration<I>

  registerInitializer<I extends Core.Initializer>(token: Token, options: {
    constructor: Types.Constructor<I>
    mode?: Mode,
  }): Registration<I>

  registerInitializerConstructor<I extends Core.Initializer>(token: Token, constructor: Types.Constructor<I>, options?: {
    mode?: Mode,
  }): Registration<I>

  registerInitializerFactory<I extends Core.Initializer>(token: Token, factory: Types.Factory<I>, options?: {
    mode?: Mode,
  }): Registration<I>

  resolve<R extends ReturnType<Types.Resolver>>(resolver: Types.Resolver<R>, options?: {
    mode?: Mode,
  }): Registration<R>

  resolveConstructor<R extends InstanceType<Types.Constructor>>(constructor: Types.Constructor<R>, options?: {
    mode?: Mode,
  }): Registration<R>

  resolveFactory<R extends ReturnType<Types.Factory>>(factory: Types.Factory<R>, options?: {
    mode?: Mode,
  }): Registration<R>
}
