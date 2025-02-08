import * as Types from '@nodelith/types'

import { Token } from '../token';
import { Bundle } from '../bundle';
import { Access } from '../access';
import { Lifetime } from '../lifetime';
import { Registration } from './registration'

export type FunctionRegistration<R extends object> = {
  target: Types.Factory<R>
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

export class FactoryRegistration<R extends object> implements Registration<R> {
  public static create<R extends object>(options: FunctionRegistration<R>): FactoryRegistration<R> {
    return new FactoryRegistration(options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Factory<R>

  private readonly bundle: Bundle

  private readonly proxy: Bundle

  public readonly lifetime: Lifetime
  
  public readonly access: Access

  public token: Token

  public constructor(options: FunctionRegistration<R>) {
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
    return new FactoryRegistration<R>({
      token: this.token,
      target: this.target,
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
      return this.singleton.resolution = this.target(resolutionBundle)
    }

    return this.target(resolutionBundle)
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