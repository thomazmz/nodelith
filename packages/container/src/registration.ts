import * as Types from '@nodelith/types'
import * as Injection from './index'

export interface Registration<Resolution = any> {
  token: Injection.Token,
  resolution: Resolution,
}

export abstract class TargetRegistration<Resolution, Target extends Types.Constructor | Types.Resolver | Types.Factory> implements Registration<Resolution> {  
  protected static readonly DEFAULT_INJECTION_MODE: Injection.Injection = 'spread'
  protected static readonly DEFAULT_INJECTION_LIFETIME: Injection.Lifetime = 'singleton'
  protected static readonly DEFAULT_INITIALIZATION_MODE: Injection.Initialization = 'lazy'

  protected readonly target: Target
  protected readonly bundle: Injection.Bundle
  protected readonly lifetime: Injection.Lifetime
  protected readonly injection: Injection.Injection
  protected readonly initialization: Injection.Initialization

  public readonly token: Injection.Token
  
  private singleton?: Resolution

  public constructor(target: Target, options?: {
    token?: Injection.Token | undefined
    bundle?: Injection.Bundle | undefined
    lifetime?: Injection.Lifetime | undefined
    injection?: Injection.Injection | undefined
    initialization?: Injection.Initialization | undefined
  }) {
    this.target = target
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.lifetime = options?.lifetime ?? TargetRegistration.DEFAULT_INJECTION_LIFETIME
    this.injection = options?.injection ?? TargetRegistration.DEFAULT_INJECTION_MODE
    this.initialization = options?.initialization ?? TargetRegistration.DEFAULT_INITIALIZATION_MODE
  }

  private get proxy(): Resolution {
    let proxyResolution: Resolution

    return new Proxy({} as any, {
      set: (_target, property) => {
        throw new Error(`Could not set dependency property "${property.toString()}". Dependency properties can not be set through registration result.`)
      },
      get: (_target, property) => {
        if(!proxyResolution) {
          proxyResolution = this.resolve(...this.arguments)
        }
 
        return proxyResolution[property]
      },
    })
  }

  private get arguments(): any[] {
    if(this.injection === 'bundle') {
      return [this.bundle]
    }

    return [this.bundle]
  }

  public get resolution(): Resolution {
    if(this.singleton) {
      return this.singleton
    }

    if(this.initialization === 'lazy' && this.lifetime === 'transient') {
      return this.proxy
    }

    if(this.initialization === 'lazy' && this.lifetime === 'singleton') {
      return this.singleton = this.proxy
    }

    if(this.initialization === 'eager' && this.lifetime === 'transient') {
      return this.resolve(...this.arguments)
    }

    if(this.initialization === 'eager' && this.lifetime === 'singleton') {
      return this.singleton = this.resolve(...this.arguments)
    }

    throw new Error('TODO')
  }

  protected abstract resolve(...args: any): Resolution
}

export class ValueRegistration<Value> implements Registration<Value> {
  private readonly value: Value
  
  public readonly token: Injection.Token

  public constructor(value: Value, options?: {
    token?: Injection.Token
  }) {
    this.value = value
    this.token = options?.token ?? Symbol()
  }

  public get resolution() {
    return this.value
  }
}

export class ResolverRegistration<R extends ReturnType<Types.Resolver>> extends TargetRegistration<R, Types.Resolver<R>> {
  public constructor(resolver: Types.Resolver<R>, options?: {
    token?: Injection.Token
    bundle?: Injection.Bundle
    lifetime?: Injection.Lifetime
    injection?: Injection.Injection
  }) {
    super(resolver, {
      token: options?.token,
      bundle: options?.bundle,
      lifetime: options?.lifetime,
      injection: options?.injection,
      initialization: 'eager',
    })
  }

  protected resolve(...args: any) {
    return this.target(...args)
  }
}

export class FactoryRegistration<R extends Types.FactoryResult> extends TargetRegistration<R, Types.Factory<R>> {
  public constructor(factory: Types.Factory<R>, options?: {
    token?: Injection.Token
    bundle?: Injection.Bundle
    lifetime?: Injection.Lifetime
    injection?: Injection.Injection
    initialization?: Injection.Initialization
  }) {
    super(factory, {
      token: options?.token,
      bundle: options?.bundle,
      lifetime: options?.lifetime,
      injection: options?.injection,
      initialization: options?.initialization,
    })
  }

  protected resolve(...args: any) {
    return this.target(...args)
  }
}

export class ConstructorRegistration<R extends Types.ConstructorResult> extends TargetRegistration<R,  Types.Constructor<R>> {
  public constructor(constructor: Types.Constructor<R>, options?: {
    token?: Injection.Token
    bundle?: Injection.Bundle
    lifetime?: Injection.Lifetime
    injection?: Injection.Injection
    initialization?: Injection.Initialization
  }) {
    super(constructor, {
      token: options?.token,
      bundle: options?.bundle,
      lifetime: options?.lifetime,
      injection: options?.injection,
      initialization: options?.initialization,
    })
  }

  protected resolve(...args: any) {
    return new this.target(...args)
  }
}