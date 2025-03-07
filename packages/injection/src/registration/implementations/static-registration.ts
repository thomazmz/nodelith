import * as Types from '@nodelith/types'

import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Registration } from '../registration'

export type StaticRegistrationOptions = {
  token?: Token | undefined;
  access?: Access | undefined;
}

export class StaticRegistration<R> implements Registration<R> {
  public static create<R>(target: any, options?: StaticRegistrationOptions): StaticRegistration<R> {
    return new StaticRegistration(target, options)
  }

  private readonly target: any

  public readonly access: Access

  public token: Token

  public constructor(target: Types.Function<R>, options?: StaticRegistrationOptions) {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.access = options?.access ?? 'public'
  }

  public clone(): Registration<R> {
    return new StaticRegistration<R>(this.target, {
      token: this.token,
      access: this.access,
    })
  }

  public resolve(): R {
    return this.target
  }
}