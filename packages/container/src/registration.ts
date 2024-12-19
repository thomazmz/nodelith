
import * as Injection from './index'
import * as Types from '@nodelith/types'
import * as Utilities from '@nodelith/utilities'

export abstract class Registration<InstanceType = any> {
  public static readonly DEFAULT_LIFETIME: Injection.Lifetime = 'transient'
  
  public static readonly DEFAULT_ACCESS: Injection.Access = 'public'
  
  public static readonly DEFAULT_MODE: Injection.Mode = 'spread'

  private readonly resolver: Injection.Resolver<InstanceType>
  
  private singleton: InstanceType | undefined
  
  private readonly bundle: Injection.Bundle
  
  public readonly target: Injection.Target

  public readonly token: Injection.Token

  public readonly mode: Injection.Mode

  public readonly access: Injection.Access

  public readonly lifetime: Injection.Lifetime

  public constructor(target: Injection.Target, options: {
    resolver: Injection.Resolver<InstanceType>
    access?: Injection.Access,
    bundle?: Injection.Bundle
    lifetime?: Injection.Lifetime,
    mode?: Injection.Mode
    token?: Injection.Token
  }) {
    this.resolver = options.resolver
    this.target = target
    this.bundle = options.bundle ?? {}
    this.token = options?.token ?? Symbol()
    this.mode = options?.mode ?? Registration.DEFAULT_MODE
    this.access = options?.access ?? Registration.DEFAULT_ACCESS
    this.lifetime = options?.lifetime ?? Registration.DEFAULT_LIFETIME
  }

  get instance() {
    if(this.singleton) {
      return this.singleton
    }

    if(this.lifetime === 'singleton') {
      return this.singleton = this.resolve()
    }

    return this.resolve()
  }

  private resolve() {
    if(this.mode === 'bundle') {
      return this.resolver(this.target, this.bundle)
    }

    const args = Utilities.FunctionUtils.extractArguments(this.target)
    return this.resolver(this.target, ...args.map((argument) => {
      return this.bundle[argument]
    }))
  }
}

export class ConstructorRegistration<InstanceType> extends Registration<InstanceType> {
  public static resolver<InstanceType = any >(constructor: Types.Constructor<InstanceType>, ...args: any[]) {
    return new constructor(...args)
  }

  public constructor(constructor: Injection.TargetConstructor, options?: {
    resolver?: typeof ConstructorRegistration.resolver
    bundle?: Injection.Bundle
    token?: Injection.Token
    mode?: Injection.Mode
    access?: Injection.Access,
    lifetime?: Injection.Lifetime,
  }) {
    super(constructor, { resolver: ConstructorRegistration.resolver, 
      ...options
    })
  }
}

export class FactoryRegistration<InstanceType> extends Registration<InstanceType> {
  public static resolver<InstanceType = any >(factory: Types.Factory<InstanceType>, ...args: any[]) {
    return factory(...args)
  }

  public constructor(factory: Injection.TargetFactory, options?: {
    resolver?: typeof FactoryRegistration.resolver
    bundle?: Injection.Bundle
    token?: Injection.Token
    mode?: Injection.Mode
    access?: Injection.Access,
    lifetime?: Injection.Lifetime,
  }) {
    super(factory, { resolver: FactoryRegistration.resolver, 
      ...options
    })
  }
}

export class ValueRegistration<InstanceType> extends Registration<InstanceType> {
  public static resolver<InstanceType = any>(value: Injection.TargetValue<InstanceType>) {
    return value
  }

  public constructor(value: Injection.TargetValue, options?: {
    bundle?: Injection.Bundle
    token?: Injection.Token
  }) {
    super(value, { resolver: ValueRegistration.resolver, 
      ...options
    })
  }
}
