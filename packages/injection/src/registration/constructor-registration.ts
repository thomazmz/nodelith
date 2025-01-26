
import * as Types from '@nodelith/types'
import * as Utilities from '@nodelith/utilities'

import { Mode } from "../mode";
import { Token } from "../token";
import { Bundle } from "../bundle";
import { Access } from "../access";
import { Lifetime } from "../lifetime";

import { Registration } from "./registration";

export type ConstructorRegistrationOptions = {
  token?: Token | undefined
  bundle?: Bundle | undefined
  mode?: Mode | undefined
  access?: Access | undefined
  lifetime?: Lifetime | undefined
}

export class ConstructorRegistration<R extends InstanceType<Types.Constructor>> implements Registration<R> {
  public static create<R extends InstanceType<Types.Constructor>>(
    options: ConstructorRegistrationOptions & { constructor: Types.Constructor<R> }
  ): ConstructorRegistration<R> {
    return new ConstructorRegistration(options.constructor, options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Constructor<R>

  private readonly mode: Mode
  private readonly bundle: Bundle
  private readonly access: Access
  private readonly lifetime: Lifetime

  public readonly token: Token

  private constructor(
    target: Types.Constructor<R>,
    options?: ConstructorRegistrationOptions
  ) {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.mode = options?.mode ?? 'spread'
    this.access = options?.access ?? 'public' 
    this.lifetime = options?.lifetime ?? 'singleton'
  }

  public clone(bundle?: Bundle): Registration<R> {
    return new ConstructorRegistration(this.target, {
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
      return this.singleton.resolution = new this.target(...parameters)
    }

    return new this.target(...parameters)
  }

  private resolveTargetParameters(bundle: Bundle): Array<unknown> {
    if(this.mode === 'bundle') {
      return [bundle]
    }

    const constructor = this.target.prototype.constructor ?? this.target
          
    const parameters = Utilities.FunctionUtils.extractArguments(constructor)

    return parameters.map(parameter => {
      return bundle[parameter]
    })
  }
}
