import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

export class Module extends Core.Initializer {
  public static readonly DEFAULT_ACCESS: Injection.Access = 'public'

  public static readonly DEFAULT_LIFETIME: Injection.Lifetime = 'transient'
  
  public static readonly DEFAULT_MODE: Injection.Mode = 'spread'

  private readonly mode: Injection.Mode
  
  private readonly lifetime: RegistrationLifetime
  
  private readonly injection: RegistrationInjection

  private readonly initializers: Array<Core.Initializer> = []
  
  protected readonly container = new Container()

  public constructor(options?: {
    access?: Injection.Access,
    lifetime?: Injection.Lifetime,
    mode?: Injection.Mode
  }) {
    super()
    this.mode = options?.mode ?? Module.DEFAULT_MODE
    this.access = options?.access ?? Module.DEFAULT_ACCESS
    this.lifetime = options?.lifetime ?? Module.DEFAULT_LIFETIME
  }

  public get registrations() {
    return this.container.registrations.filter((registration) => {
      return registration.access === 'public'
    })
  }

  public async initialize(): Promise<void> {
    for await (const initializer of this.initializers) {
      await initializer.initialize()
    }
  }

  public useModule(module: Module): void {
    this.container.push(...module.container.extractScopedRegistrations())
  }
  
  public useRegistration<R = any>(registration: Registration<R>): void {
    const { token } = registration

    if(this.container.has(token)) {
      throw new Error(`Could not complete registration. Module already contain a registration under "${token.toString()}".`)
    }

    this.container.push(registration)
  }

  public registerStatic<R = any>(token: RegistrationToken, resolution: R): void {
    if(this.container.has(token)) {
      throw new Error(`Could not complete static registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new StaticRegistration(resolution, { token })
    this.container.push(registration)
  }

  public registerResolver<R extends ReturnType<Types.Resolver>>(token: RegistrationToken, resolver: Types.Resolver<R>, options?: {
    lifetime: RegistrationLifetime,
    injection: RegistrationInjection,
  }): void {
    if(this.container.has(token)) {
      throw new Error(`Could not complete resolver registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new ResolverRegistration(resolver, { 
      token, 
      lifetime: options?.lifetime ?? this.lifetime,
      injection: options?.injection ?? this.injection,
    })

    this.container.push(registration)
  }

  public registerFactory<R extends ReturnType<Types.Factory>>(token: RegistrationToken, factory: Types.Factory<R>, options?: {
    lifetime: RegistrationLifetime,
    injection: RegistrationInjection,
  }): void {
    if(this.container.has(token)) {
      throw new Error(`Could not complete factory registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new Injection.FactoryRegistration(factory, {
      bundle: this.container.bundle,
      token,
      mode: this.mode
    })

    this.container.push(registration)
  }

  public registerConstructor<R extends InstanceType<Types.Constructor>>(token: RegistrationToken, constructor: Types.Constructor<R>, options?: {
    lifetime: RegistrationLifetime,
    injection: RegistrationInjection,
  }): void {
    if(this.container.has(token)) {
      throw new Error(`Could not complete constructor registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registration = new Injection.ConstructorRegistration<Core.Initializer>(constructor, {
      bundle: this.container.bundle,
      token,
      mode: this.mode
    })

    this.container.push(registration)
  }

  public provide<R = any>(token: RegistrationToken): R {
    if(!this.container.has(token)) {
      throw new Error(`Failed while provisioning dependency. Module does not contain a registration for "${token.toString()}" token.`)
    }

    return this.container.bundle[token]
  }

  public resolveFactory<I = any, F extends Types.Factory<I> = Types.Factory<I>>(factory: F): I {
    const { instance } = new Injection.FactoryRegistration<I>(factory, {
      bundle: this.container.bundle,
      mode: this.mode
    })
  }

  public resolveConstructor<I = any, C extends Types.Constructor<I> = Types.Constructor<I>>(constructor: C): I {
    const { instance } = new Injection.ConstructorRegistration<I>(constructor, {
      bundle: this.container.bundle,
      mode: this.mode
    })
  }
}
