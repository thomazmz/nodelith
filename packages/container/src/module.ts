import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import { 
  StaticRegistration,
  FactoryRegistration,
  ResolverRegistration,
  ConstructorRegistration,
  RegistrationInjection,
  RegistrationLifetime,
  RegistrationToken,
  Registration
} from './registration'

import {
  Container
} from  './container'

export class Module {
  
  private readonly lifetime: RegistrationLifetime
  
  private readonly injection: RegistrationInjection

  private readonly initializers: Array<Core.Initializer> = []
  
  private readonly container = new Container()

  public constructor(options?: {
    lifetime?: RegistrationLifetime
    injection?: RegistrationInjection
  }) {
    this.lifetime = options?.lifetime ?? 'transient'
    this.injection = options?.injection ?? 'spread'
  }

  get registrations() {
    return this.container.registrations
  }

  public async initialize(): Promise<void> {
    for await (const initializer of this.initializers) {
      await initializer.initialize()
    }
  }

  public useModule(module: Module): void {
    this.container.push(...module.registrations.map(registration => {
      return registration.clone(this.container.bundle)
    }))
  }

  public useRegistration<R = any>(registration: Registration<R>): void {
    const { token } = registration

    if(this.container.has(token)) {
      throw new Error(`Could not complete registration. Module already contain a registration under "${token.toString()}".`)
    }

    const registrationClone = registration.clone(this.container.bundle);
    this.container.push(registrationClone)
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
      bundle: this.container.bundle,
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

    const registration = new FactoryRegistration(factory, {
      token, 
      bundle: this.container.bundle,
      lifetime: options?.lifetime ?? this.lifetime,
      injection: options?.injection ?? this.injection,
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

    const registration = new ConstructorRegistration(constructor, { 
      token, 
      bundle: this.container.bundle,
      lifetime: options?.lifetime ?? this.lifetime,
      injection: options?.injection ?? this.injection,
    })

    this.container.push(registration)
  }

  public provide<R = any>(token: RegistrationToken): R {
    if(!this.container.has(token)) {
      throw new Error(`Failed while provisioning dependency. Module does not contain a registration for "${token.toString()}" token.`)
    }

    return this.container.bundle[token]
  }

  public provideResolver<R extends ReturnType<Types.Resolver> = ReturnType<Types.Resolver>>(resolver: Types.Resolver<R>): R {
    const { resolution } = new ResolverRegistration<R>(resolver, {
      bundle: this.container.bundle
    })

    return resolution
  }

  public provideFactory<R extends ReturnType<Types.Factory> = ReturnType<Types.Factory>>(factory: Types.Factory<R>): R {
    const { resolution } = new FactoryRegistration<R>(factory, {
      bundle: this.container.bundle
    })

    return resolution
  }

  public provideConstructor<R extends InstanceType<Types.Constructor> = InstanceType<Types.Constructor>>(constructor: Types.Constructor<R>): R {
    const { resolution } = new ConstructorRegistration<R>(constructor, {
      bundle: this.container.bundle
    })

    return resolution
  }
}

