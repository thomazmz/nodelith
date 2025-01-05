import {
  Constructor,
  Resolver,
  Factory,
  Function,
} from '@nodelith/types'

export type RegistrationToken = string | symbol | number

export type RegistrationBundle = Record<RegistrationToken, any>

export type RegistrationAccess = 'public' | 'private'

export type RegistrationLifetime = 'transient' | 'singleton'

export type RegistrationInjection = 'spread' | 'bundle'

export interface Registration<R = any> {
  readonly token: RegistrationToken
  provide(bundle?: RegistrationBundle): R
  clone(bundle?: RegistrationBundle): Registration<R>
}

export class StaticRegistration<Resolution = any> implements Registration<Resolution> {

  public readonly token: RegistrationToken;

  public readonly resolution: Resolution

  public constructor(staticResolution: Resolution, options?: {
    token?: RegistrationToken
  })  {
    this.token = options?.token ?? Symbol()
    this.resolution = staticResolution
  }

  public clone(): StaticRegistration<Resolution> {
    return new StaticRegistration(this.resolution, {
      token: this.token,
    })
  }

  public provide(): Resolution {
    return this.resolution
  }
}

export class FactoryRegistration<Instance extends ReturnType<Factory>> implements Registration<Instance> {
  protected static readonly DEFAULT_LIFETIME: RegistrationLifetime = 'singleton'
  protected static readonly DEFAULT_INJECTION: RegistrationInjection = 'spread'

  public static provide<Instance extends ReturnType<Factory>>(target: Factory<Instance>, options?: {
    token?: RegistrationToken
    bundle?: RegistrationBundle
    lifetime?: RegistrationLifetime
    injection?: RegistrationInjection
  }) {
    const registration = new FactoryRegistration(target, options)
    return registration.provide()
  }

  public readonly token: RegistrationToken;

  protected readonly bundle: RegistrationBundle
  protected readonly lifetime: RegistrationLifetime
  protected readonly injection: RegistrationInjection

  protected readonly target: Factory<Instance>

  private singleton?: Instance

  public constructor(target: Factory<Instance>, options?: {
    token?: RegistrationToken
    bundle?: RegistrationBundle
    lifetime?: RegistrationLifetime
    injection?: RegistrationInjection
  })  {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.lifetime = options?.lifetime ?? FactoryRegistration.DEFAULT_LIFETIME
    this.injection = options?.injection ?? FactoryRegistration.DEFAULT_INJECTION
  }

  public clone(bundle?: RegistrationBundle): FactoryRegistration<Instance> {
    const mergedBundle = {
      ...bundle,
      ...this.bundle,
    }

    return new FactoryRegistration(this.target, {
      token: this.token,
      bundle: mergedBundle,
      lifetime: this.lifetime,
      injection: this.injection,
    })
  }

  public get resolution() {
    return this.provide()
  }

  public provide(bundle: RegistrationBundle = {}): Instance {
    if(this.singleton) {
      return this.singleton
    }

    if(this.lifetime === 'singleton') {
      return this.singleton = this.resolveProxy(bundle)
    }

    return this.resolveProxy(bundle)
  }

  private resolveProxy(bundle?: RegistrationBundle) {
    let instance: Instance | undefined;

    return new Proxy({} as Instance, {
      set: (_target, property) => {
        throw new Error(
          `Could not set property "${property.toString()}". Properties can not be set through registration.`
        );
      },
      get: (_target, property) => {

        const parameters = [{
          ...bundle,
          ...this.bundle
        }]
    
        if (!instance) {
          instance = this.target(...parameters);
        }
  
        return instance[property];
      }
    });
  }
}

export class ConstructorRegistration<Instance extends InstanceType<Constructor>> implements Registration<Instance> {
  protected static readonly DEFAULT_LIFETIME: RegistrationLifetime = 'singleton'
  protected static readonly DEFAULT_INJECTION: RegistrationInjection = 'spread'

  public static provide<Instance extends InstanceType<Constructor>>(target: Constructor<Instance>, options?: {
    token?: RegistrationToken
    bundle?: RegistrationBundle
    lifetime?: RegistrationLifetime
    injection?: RegistrationInjection
  }) {
    const registration = new ConstructorRegistration(target, options)
    return registration.provide()
  }

  public readonly token: RegistrationToken;

  protected readonly bundle: RegistrationBundle
  protected readonly lifetime: RegistrationLifetime
  protected readonly injection: RegistrationInjection

  protected readonly target: Constructor<Instance>

  private singleton?: Instance

  public constructor(target: Constructor<Instance>, options?: {
    token?: RegistrationToken
    bundle?: RegistrationBundle
    lifetime?: RegistrationLifetime
    injection?: RegistrationInjection
  })  {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.lifetime = options?.lifetime ?? ConstructorRegistration.DEFAULT_LIFETIME
    this.injection = options?.injection ?? ConstructorRegistration.DEFAULT_INJECTION
  }

  public clone(bundle?: RegistrationBundle): ConstructorRegistration<Instance> {
    const mergedBundle = {
      ...bundle,
      ...this.bundle,
    }

    return new ConstructorRegistration(this.target, {
      token: this.token,
      bundle: mergedBundle,
      lifetime: this.lifetime,
      injection: this.injection,
    })
  }

  public provide(bundle: RegistrationBundle = {}): Instance {
    if(this.singleton) {
      return this.singleton
    }

    if(this.lifetime === 'singleton') {
      return this.singleton = this.resolveProxy(bundle)
    }

    return this.resolveProxy(bundle)
  }

  protected resolveProxy(bundle?: RegistrationBundle) {
    let instance: Instance | undefined;

    return new Proxy({} as Instance, {
      set: (_target, property) => {
        throw new Error(
          `Could not set property "${property.toString()}". Properties can not be set through registration.`
        );
      },
      get: (_target, property) => {

        const parameters = [{
          ...bundle,
          ...this.bundle
        }]
    
        if (!instance) {
          instance = new this.target(...parameters);
        }
  
        return instance[property];
      }
    });
  }
}

export class ResolverRegistration<Value extends ReturnType<Resolver>> implements Registration<Value> {
  protected static readonly DEFAULT_LIFETIME: RegistrationLifetime = 'singleton'
  protected static readonly DEFAULT_INJECTION: RegistrationInjection = 'spread'

  public static provide<Value extends ReturnType<Resolver>>(target: Resolver<Value>, options?: {
    token?: RegistrationToken
    bundle?: RegistrationBundle
    lifetime?: RegistrationLifetime
    injection?: RegistrationInjection
  }) {
    const registration = new ResolverRegistration(target, options)
    return registration.provide()
  }

  public readonly token: RegistrationToken;

  protected readonly bundle: RegistrationBundle
  protected readonly lifetime: RegistrationLifetime
  protected readonly injection: RegistrationInjection

  protected readonly target: Resolver<Value>

  private singleton?: Value

  public constructor(target: Resolver<Value>, options?: {
    token?: RegistrationToken
    bundle?: RegistrationBundle
    lifetime?: RegistrationLifetime
    injection?: RegistrationInjection
  }) {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.lifetime = options?.lifetime ?? ResolverRegistration.DEFAULT_LIFETIME
    this.injection = options?.injection ?? ResolverRegistration.DEFAULT_INJECTION
  }

  public clone(bundle?: RegistrationBundle): ResolverRegistration<Value> {
    return new ResolverRegistration(this.target, {
      token: this.token,
      bundle: this.bundle,
      lifetime: this.lifetime,
      injection: this.injection,
    })
  }

  public provide(): Value {
    if(this.singleton) {
      return this.singleton
    }

    if(this.lifetime === 'singleton') {
      return this.singleton = this.target(this.bundle)
    }

    return this.target(this.bundle)
  }
}
