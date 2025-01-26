import { Bundle } from '../bundle';
import { Mode } from '../mode';
import { Access } from '../access';
import { Lifetime } from '../lifetime';
import { Registration } from 'registration/registration';
import { Token } from 'token';

export type StaticRegistrationOptions = {
  token?: Token | undefined
  access?: Access | undefined
}

export class StaticRegistration<R extends any> implements Registration<R> {
  public static create<R extends any>(
    options: StaticRegistrationOptions & { static: R }
  ): StaticRegistration<R> {
    return new StaticRegistration(options.static, options)
  }

  public readonly token: Token;

  public readonly access: Access

  private readonly resolution: R
  
  public constructor(
    resolution: R,
    options?: StaticRegistrationOptions
  ) {
    this.resolution = resolution;
    this.token = options?.token ?? Symbol()
    this.access = options?.access ?? 'public' 
  }

  public resolve(): R {
    return this.resolution;
  }

  public clone(): Registration<R> {
    return new StaticRegistration(this.resolution,{
      token: this.token,
      access: this.access
    })
  }
}