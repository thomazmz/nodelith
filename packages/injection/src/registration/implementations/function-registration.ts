import * as Types from '@nodelith/types'

import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Lifetime } from '../../lifetime';
import { Registration } from '../registration'

export type FunctionRegistrationOptions = {
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

export class FunctionRegistration<R extends any> implements Registration<R> {
  public static create<R extends any>(target: Types.Function<R>, options?: FunctionRegistrationOptions): FunctionRegistration<R> {
    return new FunctionRegistration(target, options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Function<R>

  public readonly access: Access

  private readonly bundle: Bundle

  public readonly lifetime: Lifetime

  public token: Token

  public constructor(target: Types.Function<R>, options?: FunctionRegistrationOptions) {
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.access = options?.access ?? 'public'
    this.lifetime = options?.lifetime ?? 'singleton'
    this.target = target
  }

  public clone(bundle?: Bundle): Registration<R> {
    return new FunctionRegistration<R>(this.target, {
      token: this.token,
      access: this.access,
      lifetime: this.lifetime,
      bundle,
    })
  }

  public resolve(bundle?: Bundle): R {
    if('resolution' in this.singleton) {
      return this.singleton.resolution
    }

    if(this.lifetime === 'singleton') {
      return this.singleton.resolution = this.target({
        ...this.bundle,
        ...bundle,
      })
    }

    return this.target(this.bundle)
  };
}