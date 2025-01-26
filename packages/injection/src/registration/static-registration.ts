import { Bundle } from '../bundle';
import { Mode } from '../mode';
import { Access } from '../access';
import { Lifetime } from '../lifetime';
import { Registration } from 'registration/registration';
import { Token } from 'token';

export type StaticRegistrationOptions = {
  token?: Token | undefined
  mode?: Mode | undefined
  access?: Access | undefined
  lifetime?: Lifetime | undefined
}

export class StaticRegistration<R extends any> implements Registration<R> {
  public static create<R extends any>(
    options: StaticRegistrationOptions & { static: R }
  ): StaticRegistration<R> {
    return new StaticRegistration(options.static, options)
  }

  public readonly token: Token;

  public readonly mode: Mode
  public readonly access: Access
  public readonly lifetime: Lifetime

  private readonly resolution: R
  
  public constructor(
    resolution: R,
    options?: StaticRegistrationOptions
  ) {
    this.resolution = resolution;
    this.token = options?.token ?? Symbol()
    this.mode = options?.mode ?? 'spread'
    this.access = options?.access ?? 'public' 
    this.lifetime = options?.lifetime ?? 'singleton'
  }

  public resolve(): R {
    return this.resolution;
  }

  public clone(): Registration<R> {
    return new StaticRegistration(this.resolution)
  }
}