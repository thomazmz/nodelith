import * as Types from '@nodelith/types'
import { Registration } from '../registration'
import { FactoryRegistration } from '../registration'
import { FactoryRegistrationOptions } from '../registration'

import { Container } from '../container'
import { Bundle } from '../bundle'
import { Token } from '../token'

export type ModuleOptions = {
  container?: Container | undefined,
}

import crypto from 'node:crypto'

export class Module {

  private readonly name = crypto.randomBytes(2).toString('hex').slice(0, 4) 

  private readonly container: Container
  
  public readonly children: Module[] = []

  public constructor(options?: ModuleOptions) {
    this.container = options?.container ?? new Container()
  }

  public exposes(token: Token): boolean {
    return false
      || this.container.exposes(token)
      || this.children.some(child => child.exposes(token))
  }

  public has(token: Token): boolean  {
    return false
      || this.container.has(token)
      || this.children.some(child => child.has(token))
  }

  public useModules(...externalModules: Module[]): Module {
    externalModules.forEach(externalModule => {
      this.useModule(externalModule)
    })
    
    return this
  }

  // public useModule(externalModule: Module): Module {
  //   // Share all registrations on this module's container with the child module
  //   const child = externalModule.clone(this.container.bundle);
  //   // Share this module with all modules under the child module
  //   // child.children.forEach(module => module.children.push(this));
  //   this.children.push(child)
  //   return this
  // }

  public useModule(externalModule: Module): Module {
    const child = externalModule.clone(this.container.bundle);
    this.children.push(child)
    return this
  }

  public clone(bundle?: Bundle): Module {
    const container = this.container.clone(bundle)
    const moduleClone = new Module({ container })
    moduleClone.useModules(...this.children)
    return moduleClone
  }

  public resolve(token: Token, bundle?: Bundle) {
    if(!this.exposes(token)) {
      return undefined;
    }

    const proxy: Bundle = new Proxy(bundle ?? {}, {
      get: (target, token) => {
        return this.children.find(module => {
          return module.exposes(token)
        })?.resolve(token)
      }
    })

    if(this.container.exposes(token)) {
      const registration = this.container.get(token)
      return registration?.resolve(proxy)
    }

    const resolutionModule = this.children.find(module => {
      return module.exposes(token)
    })

    if(!resolutionModule) {
      return undefined
    }

    return resolutionModule.resolve(token)
  }

  public register<R extends ReturnType<Types.Factory>>(
    token: Token,
    options: Omit<FactoryRegistrationOptions<R>, 'token' | 'target'> & { factory: Types.Factory }
  ): Registration<R> {
    return this.container.register(FactoryRegistration.create({
      lifetime: options?.lifetime,
      target: options?.factory,
      access: options?.access,
      token,
    }))
  }
}
