import * as Types from '@nodelith/types'
import * as Utilities from '@nodelith/utilities'

import { Mode } from '../mode';
import { Token } from '../token';
import { Access } from '../access';
import { Bundle } from '../bundle';
import { Lifetime } from '../lifetime';

import { Registration } from './registration';

export type FactoryRegistrationOptions = {
  token?: Token | undefined
  bundle?: Bundle | undefined
  mode?: Mode | undefined
  access?: Access | undefined
  lifetime?: Lifetime | undefined
}

export class FactoryRegistration<R extends ReturnType<Types.Factory>> implements Registration<R> {
  public static create<R extends ReturnType<Types.Factory>>(
    options: FactoryRegistrationOptions & { factory: Types.Factory<R> }
  ): FactoryRegistration<R> {
    return new FactoryRegistration(options.factory, options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Factory<R>

  private readonly bundle: Bundle
  
  public readonly mode: Mode

  public readonly access: Access

  public readonly lifetime: Lifetime

  public readonly token: Token

  private constructor(
    target: Types.Factory<R>,
    options?: FactoryRegistrationOptions
  ) {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.mode = options?.mode ?? 'spread'
    this.access = options?.access ?? 'public' 
    this.lifetime = options?.lifetime ?? 'singleton'
  }

  public clone(bundle?: Bundle): Registration<R> {
    return new FactoryRegistration(this.target, {
      lifetime: this.lifetime,
      access: this.access,
      token: this.token,
      mode: this.mode,
      bundle: {
        ...bundle,
        ...this.bundle,
      },
    })
  }

  public resolve(bundle?: Bundle): R {
    if('resolution' in this.singleton) {
      return this.singleton.resolution
    }

    const parameters = this.resolveTargetParameters({ ...bundle, ...this.bundle })

    if(this.lifetime === 'singleton') {
      return this.singleton.resolution = this.target(...parameters)
    }

    return this.target(...parameters)
  }

  private resolveTargetParameters(bundle: Bundle): Array<unknown> {
    if(this.mode === 'bundle') {
      return [bundle]
    }

    const parameters = Utilities.FunctionUtils
      .extractArguments(this.target)

    return parameters.map(parameter => {
      return bundle[parameter]
    })
  }
}
