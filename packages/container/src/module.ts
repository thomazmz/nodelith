import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'
import * as Injection from './index'

export class Module extends Core.Initializer {

  private readonly mode?: Injection.Mode
  
  private readonly access?: Injection.Access
  
  private readonly lifetime?: Injection.Lifetime

  private readonly initializers: Array<Core.Initializer> = []
  
  private readonly container = new Injection.Container()

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
    for (const registration of module.registrations) {
      this.useRegistration(registration)
    }

    this.initializers.push(module)
  }

  public useInitializer(initializer: Types.Constructor<Core.Initializer>): void {
    const { instance } = new Injection.ConstructorRegistration<Core.Initializer>(initializer, {
      bundle: this.container.bundle,
    })

    this.initializers.push(instance)
  }

  public useRegistration(registration: Injection.Registration): void {
    if(this.container.has(registration.token)) {
      throw new Error(`Module can not use registration. Module already contain a registration for "${registration.token.toString()}" token.`)
    }

    this.container.push(registration)
  }

  public registerValue(token: Injection.Token, value: any): void {
    if(this.container.has(token)) {
      throw new Error(`Could not complete value registration. Module already contain a registration for "${token.toString()}" token.`)
    }

    const registration = new Injection.ValueRegistration(value, {
      bundle: this.container.bundle,
      token,
    })

    this.container.push(registration)
  }

  public registerFactory(token: Injection.Token, factory: Injection.TargetFactory): void {
    if(this.container.has(token)) {
      throw new Error(`Could not complete factory registration. Module already contain a registration for "${token.toString()}" token.`)
    }

    const registration = new Injection.FactoryRegistration(factory, {
      bundle: this.container.bundle,
      token,
    })

    this.container.push(registration)
  }

  public registerConstructor(token: Injection.Token, constructor: Injection.TargetConstructor): void {
    if(this.container.has(token)) {
      throw new Error(`Could not complete constructor registration. Module already contain a registration for "${token.toString()}" token.`)
    }

    const registration = new Injection.ConstructorRegistration<Core.Initializer>(constructor, {
      bundle: this.container.bundle,
      token,
    })

    if(Core.Initializer.isExtendedBy(constructor)) {
      this.initializers.push(registration.instance)
    }

    this.container.push(registration)
  }

  public resolveToken<I>(token: Injection.Token): I {
    if(!this.container.has(token)) {
      throw new Error(`Could not complete token resolution. Module does not contain a registration for "${token.toString()}" token.`)
    }

    return this.container.bundle[token]
  }

  public resolveFactory<I = any, F extends Types.Factory<I> = Types.Factory<I>>(factory: F): I {
    const { instance } = new Injection.FactoryRegistration<I>(factory, {
      bundle: this.container.bundle
    })

    return instance
  }

  public resolveConstructor<I = any, C extends Types.Constructor<I> = Types.Constructor<I>>(constructor: C): I {
    const { instance } = new Injection.ConstructorRegistration<I>(constructor, {
      bundle: this.container.bundle
    })

    return instance
  }
}
