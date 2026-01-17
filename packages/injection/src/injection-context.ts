import { Identity } from '@nodelith/identity'

export class InjectionContext {
  public static create() {
    return new InjectionContext()
  }

  private constructor() {
    Identity.assign(this)
  }

  public get identity() {
    return Identity.extract(this)
  }

  private instances: Map<Identity, any> = new Map()
 
  public resolve<T>(target: (...args: any[]) => T, ...args: any[]): T {
    const identity = Identity.obtain(target)

    if (this.instances.has(identity)) {
      return this.instances.get(identity)
    }

    const result = target(...args)

    this.instances.set(identity, result)

    return result
  }
}
