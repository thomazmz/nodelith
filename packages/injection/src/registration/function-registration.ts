import { Bundle } from "bundle";
import { Lifetime } from "lifetime";
import { Mode } from "mode";
import { Registration } from "registration/registration";
import { Token } from "token";
import * as Types from '@nodelith/types'
import * as Utilities from '@nodelith/utilities'
import { Access } from "access";

export type FunctionRegistrationOptions = {
  token?: Token | undefined
  bundle?: Bundle | undefined
  mode?: Mode | undefined
  access?: Access | undefined
  lifetime?: Lifetime | undefined
}

export class FunctionRegistration<R extends ReturnType<Types.Function>> implements Registration<R> {
  public static create<R extends ReturnType<Types.Function>>(
    options: FunctionRegistrationOptions & { function: Types.Function<R> }
  ): FunctionRegistration<R> {
    return new FunctionRegistration(options.function, options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Function<R>

  private readonly mode: Mode
  private readonly bundle: Bundle
  private readonly access: Access
  private readonly lifetime: Lifetime

  public readonly token: Token

  private constructor(
    target: Types.Function<R>,
    options?: FunctionRegistrationOptions
  ) {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.mode = options?.mode ?? 'spread'
    this.access = options?.access ?? 'public' 
    this.lifetime = options?.lifetime ?? 'singleton'
  }

  public clone(bundle?: Bundle): Registration<R> {
    return new FunctionRegistration(this.target, {
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
