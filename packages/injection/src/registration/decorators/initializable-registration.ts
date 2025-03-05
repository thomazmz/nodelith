import * as Core from '@nodelith/core'

import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Registration } from '../registration'

export class InitializableRegistration<R extends object> implements Registration<R>, Core.Initializer {
  public static create<R extends object>(registration: Registration<Core.Initializer<R>>): InitializableRegistration<R> {
    return new InitializableRegistration(registration)
  }

  private readonly registration: Registration<Core.Initializer<R>>

  private initializer?: Core.Initializer<R>

  private resolution?: R | undefined

  get token(): Token {
    return this.registration.token
  }

  get access(): Access {
    return this.registration.access
  }

  private constructor(registration: Registration<Core.Initializer<R>>) {
    this.registration = registration
  }

  public async initialize(): Promise<void> {
    this.initializer = this.registration.resolve()
    this.resolution = await this.initializer.initialize()
  }

  public async terminate(): Promise<void> {
    this.registration.resolve()?.terminate?.()
  }

  public clone(bundle?: Bundle): InitializableRegistration<R> {
    return new InitializableRegistration(
      this.registration.clone(bundle)
    )
  }

  public resolve(): R {
    if(!this.resolution) {
      throw new Error(`Cannot resolve ${this.token.toString()}. Registration requires initialization.`)
    }

    return this.resolution
  };
}