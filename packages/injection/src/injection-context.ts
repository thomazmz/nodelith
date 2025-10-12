import { CoreIdentity } from '@nodelith/core'
import { InjectionRegistration } from './injection-registration'

export class InjectionContext {
  public static create() {
    return new InjectionContext()
  }

  private constructor() {
    CoreIdentity.assign(this)
  }

  public get identity() {
    return CoreIdentity.extract(this)
  }

  private instances: Map<CoreIdentity, any> = new Map()

  public delete(token: InjectionRegistration.Token): void {
    this.instances.delete(token)
  }
 
  public resolve<T>(target: (...args: any[]) => T, ...args: any[]): T {
    const identity = CoreIdentity.obtain(target)

    if (this.instances.has(identity)) {
      return this.instances.get(identity)
    }

    const result = target(...args)

    this.instances.set(identity, result)

    return result
  }
}
