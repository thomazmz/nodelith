import * as Types from '@nodelith/types'

import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Lifetime } from '../../lifetime';
import { Registration } from '../registration'

export type ConstructorRegistrationOptions = {
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

export class ConstructorRegistration<R extends object> implements Registration<R> {
  public static create<R extends object>(target: Types.Constructor<R>, options?: ConstructorRegistrationOptions): ConstructorRegistration<R> {
    return new ConstructorRegistration(target, options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Constructor<R>

  public readonly access: Access

  private readonly bundle: Bundle

  public readonly lifetime: Lifetime

  public token: Token

  public constructor(target: Types.Constructor<R>, options?: ConstructorRegistrationOptions) {
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.access = options?.access ?? 'public'
    this.lifetime = options?.lifetime ?? 'singleton'
    this.target = target
  }

  public clone(bundle?: Bundle): Registration<R> {
    return new ConstructorRegistration<R>(this.target, {
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

    const resolutionBundle = this.createResolutionBundle(bundle)

    if(this.lifetime === 'singleton') {
      return this.singleton.resolution = new this.target(resolutionBundle)
    }

    return new this.target(resolutionBundle)
  };

  private createResolutionBundle(bundle: Bundle = {}): Bundle {
    return new Proxy(bundle, {
      set: (_target: Bundle, token: Token) => {
        throw new Error(`Could not set bundle key "${token.toString()}". Targets are not allowed to assign bundle values.`)
      },
      get: (target, token) => {
        if(token  === this.token) {
          throw new Error(`Could not access bundle key "${token.toString()}". Target should not access its own token.`)
        }
        if(token in this.bundle) {
          return this.bundle[token]
        }
        return target[token]
      } 
    })
  }
}