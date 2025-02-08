
import * as Types from '@nodelith/types'

import { Token } from '../token';
import { Bundle } from '../bundle';
import { Access } from '../access';
import { Lifetime } from '../lifetime';
import { Registration } from './registration'

export type ConstructorRegistrationOptions<R extends object> = {
  target: Types.Constructor<R>
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

export class ConstructorRegistration<R extends object> implements Registration<R> {
  public static create<R extends object>(options: ConstructorRegistrationOptions<R>): ConstructorRegistration<R> {
    return new ConstructorRegistration(options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Constructor<R>

  private readonly bundle: Bundle

  private readonly proxy: Bundle

  public readonly lifetime: Lifetime
  
  public readonly access: Access

  public token: Token

  public constructor(options: ConstructorRegistrationOptions<R>) {
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.access = options?.access ?? 'public'
    this.lifetime = options?.lifetime ?? 'singleton'
    this.target = options.target

    this.proxy = new Proxy(this.bundle ?? {}, {
      set: (_target: Bundle, token: Token) => {
        throw new Error(`Could not set bundle key "${token.toString()}". Targets are not allowed to assign bundle values.`)
      }
    })
  }

  public clone(bundle?: Bundle): Registration<R> {
    return new ConstructorRegistration<R>({
      token: this.token,
      bundle: bundle,
      target: this.target,
      access: this.access,
      lifetime: this.lifetime,
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
    return new Proxy(this.proxy, {
      get: (target, token) => {
        if(token  === this.token) {
          throw new Error(`Could not access bundle key "${token.toString()}". Target should access its own token.`)
        }
        if(token in this.bundle) {
          return this.bundle[token]
        }
        if(token in bundle) {
          return bundle[token]
        }
        return target[token]
      } 
    })
  }
}