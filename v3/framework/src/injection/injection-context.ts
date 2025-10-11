import { Core } from '@refresh/framework/core'
import { InjectionRegistration } from './injection-registration'

export class InjectionContext {
  public static create() {
    return new InjectionContext()
  }

  private constructor() {
    Core.Identity.assign(this)
  }

  public get identity() {
    return Core.Identity.extract(this)
  }

  private instances: Map<Core.Identity, any> = new Map()

  public delete(token: InjectionRegistration.Token): void {
    this.instances.delete(token)
  }
 
  public resolve<T>(target: (...args: any[]) => T, ...args: any[]): T {
    const identity = Core.Identity.obtain(target)

    if (this.instances.has(identity)) {
      return this.instances.get(identity)
    }

    const result = target(...args)

    this.instances.set(identity, result)

    return result
  }
}
