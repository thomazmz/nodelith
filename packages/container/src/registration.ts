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
  readonly token: RegistrationToken,
  readonly resolution: R,
  resolve: Function<R>,
  clone: Function<Registration<R>, [{ bundle?:  RegistrationBundle }]>
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

  public resolve(): Resolution {
    return this.resolution
  }
}

export class FactoryRegistration<Object extends ReturnType<Factory>> implements Registration<Object> {
  protected static readonly DEFAULT_LIFETIME: RegistrationLifetime = 'singleton'
  protected static readonly DEFAULT_INJECTION: RegistrationInjection = 'spread'

  public readonly token: RegistrationToken;

  protected readonly bundle: RegistrationBundle
  protected readonly lifetime: RegistrationLifetime
  protected readonly injection: RegistrationInjection

  protected readonly target: Factory<Object>

  private singleton?: Object

  public constructor(target: Factory<Object>, options?: {
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

  private createProxy(...parameters: any[]) {
    let instance: Object | undefined;

    return new Proxy({} as Object, {
      set: (_target, property) => {
        throw new Error(
          `Could not set property "${property.toString()}". Properties can not be set through registration.`
        );
      },
      get: (_target, property) => {
        if (!instance) {
          instance = this.target(...parameters);
        }
  
        return instance[property];
      }
    });
  }

  public clone(bundle?: RegistrationBundle): FactoryRegistration<Object> {
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

  public resolve(bundle: RegistrationBundle = {}): Object {
    if(this.singleton) {
      return this.singleton
    }

    const parameters = [this.bundle]

    if(this.lifetime === 'singleton') {
      return this.singleton = this.createProxy(...parameters)
    }

    return this.createProxy(...parameters)
  }

  public get resolution() {
    return this.resolve()
  }
}

export class ConstructorRegistration<Instance extends InstanceType<Constructor>> implements Registration<Instance> {
  protected static readonly DEFAULT_LIFETIME: RegistrationLifetime = 'singleton'
  protected static readonly DEFAULT_INJECTION: RegistrationInjection = 'spread'

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

  private createProxy(...parameters: any[]) {
    let instance: Instance | undefined;

    return new Proxy({} as Instance, {
      set: (_target, property) => {
        throw new Error(
          `Could not set property "${property.toString()}". Properties can not be set through registration.`
        );
      },
      get: (_target, property) => {
        if (!instance) {
          instance = new this.target(...parameters);
        }
  
        return instance[property];
      }
    });
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

  public resolve(): Instance {
    if(this.singleton) {
      return this.singleton
    }

    if(this.lifetime === 'singleton') {
      return this.singleton = this.createProxy(this.bundle)
    }

    return this.createProxy(this.bundle)
  }

  public get resolution() {
    return this.resolve()
  }
}

export class ResolverRegistration<Value extends ReturnType<Resolver>> implements Registration<Value> {
  protected static readonly DEFAULT_LIFETIME: RegistrationLifetime = 'singleton'
  protected static readonly DEFAULT_INJECTION: RegistrationInjection = 'spread'

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
  })  {
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

  public resolve(): Value {
    if(this.singleton) {
      return this.singleton
    }

    if(this.lifetime === 'singleton') {
      return this.singleton = this.target(this.bundle)
    }

    return this.target(this.bundle)
  }

  get resolution() { 
    return this.resolve()
  }
}
