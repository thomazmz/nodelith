import { InjectionRegistration } from './injection-registration'
import { Identity } from '@nodelith/identity'

export class InjectionTrace {
  public static create() {
    return new InjectionTrace()
  }

  private stack: string[] = []
 
  private constructor() {
    Identity.assign(this)
  }

  public get identity() {
    return Identity.extract(this)
  }

  private stringfy(...tokens: string[]): string {
    return [...this.stack, ...tokens].join(' > ')
  }

  public resolve<T>(registration: InjectionRegistration<T>, ...args: Parameters<InjectionRegistration<T>['resolve']>): ReturnType<InjectionRegistration<T>['resolve']> {
    if(this.stack.includes(registration.token)) {
      throw new Error(`Could not resolve token "${registration.token}". Cyclic dependency graph: ${this.stringfy(registration.token)}.`)
    }

    try {
      this.stack.push(registration.token)
      return registration.resolve(...args)
    } finally {
      this.stack.pop()
    }
  }
}
