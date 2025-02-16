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

  private readonly container: Container

  public constructor(options?: ModuleOptions)  {
    this.container = options?.container ?? new Container()
    this.container.registrations.forEach((registration) => {
      this.useRegistration(registration)
    })
  }

  public exposes(token: Token) {
    return token in this.upstreamBundle
  }

  public clone(bundle?: Bundle): Module {
    const moduleClone = new Module({ container: this.container.clone(bundle) })
    moduleClone.extend(...this.modules)
    return moduleClone
  }

  public extend<R>(modules: Module): Module

  public extend(...modules: Module[]): Module[]

  public extend(...modules: Module[]): Module | Module[] {
    if(modules.length > 1)  {
      return modules.map(externalRegistration => {
        return this.extend(externalRegistration)
      })
    }

    if(!modules[0]) {
      return []
    }

    const module = modules[0].clone(this.downstreamBundle)
    this.useBundle(module.upstreamBundle)
    this.modules.push(module)
    return module
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

  public useBundle(bundle: Bundle): void {
    const bundleDescriptors = Object.getOwnPropertyDescriptors(bundle)
    Object.defineProperties(this.container.bundle, Object.fromEntries(
      Object.entries(bundleDescriptors).filter(([token]) => {
        return !this.container.has(token)
      })
    ))
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
}