import * as Types from '@nodelith/types'

import { FactoryRegistrationOptions } from '../registration'
import { FactoryRegistration } from '../registration'
import { Registration } from '../registration'
import { Container } from '../container'
import { Bundle } from '../bundle'
import { Token } from '../token'

type ModuleOptions = {
  container?: Container | undefined
}

export class Module {

  private readonly downstreamBundle: Bundle = {}

  private readonly upstreamBundle: Bundle = {}

  private readonly modules: Module[] = []

  public readonly container: Container

  constructor(options?: ModuleOptions)  {
    this.container = options?.container ?? new Container()
    this.useRegistrations(...this.container.registrations)
  }

  public exposes(token: Token) {
    return token in this.upstreamBundle
  }

  public clone(bundle?: Bundle): Module {
    const moduleClone = new Module({ container: this.container.clone(bundle) })
    moduleClone.useModules(...this.modules)
    return moduleClone
  }

  public useModules(...externalModules: Module[]): void {
    externalModules.forEach(externalModule => this.useModule(externalModule))
  }

  public useModule(externalModule: Module): void {
    const childModule = externalModule.clone(this.downstreamBundle)
    this.useBundle(childModule.upstreamBundle)
    this.modules.push(childModule)
  }

  public useBundle(bundle: Bundle): void {
    const bundleDescriptors = Object.getOwnPropertyDescriptors(bundle)
    Object.defineProperties(this.container.bundle, Object.fromEntries(
      Object.entries(bundleDescriptors).filter(([token]) => {
        return !this.container.has(token)
      })
    ))
  }

  public useRegistrations(...registrations: Registration[]): void {
    registrations.forEach(registration => this.useRegistration(registration))
  }

  public useRegistration({ token, access, resolve }: Registration): void {
    const registrationDescriptor = {
      get: () => this.container.resolve(token),
      configurable: true,
      enumerable: true,
    }

    if(!(token in this.upstreamBundle) && ['external', 'public'].includes(access)) {
      Object.defineProperty(this.upstreamBundle, token, registrationDescriptor)
    }

    if(!(token in this.downstreamBundle) && ['internal', 'public'].includes(access)) {
      Object.defineProperty(this.downstreamBundle, token, registrationDescriptor)
    }
  }
  
  public register<R extends ReturnType<Types.Factory>>(
    token: Token,
    options: Omit<FactoryRegistrationOptions<R>, 'token' | 'target'> & { factory: Types.Factory }
  ): Registration<R> {
    const registration = this.container.register<R>(
      FactoryRegistration.create({
        lifetime: options?.lifetime,
        target: options?.factory,
        access: options?.access,
        token,
      })
    )

    this.useRegistration(registration)
 
    return registration
  }

  public resolve(token: Token) {
    return this.exposes(token) 
      ? this.container.resolve(token)
      : undefined
  }
}