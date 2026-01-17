import { ConstructorType } from '@nodelith/utilities'
import { FactoryType } from '@nodelith/utilities'
import { CoreInitializer } from '@nodelith/core'

import { InjectionRegistration } from './injection-registration'
import { InjectionContext } from './injection-context'

export declare namespace InjectionInitializer {
  export type DeclarationOptions = {
    readonly token?: string | undefined
    readonly params?: string[] | undefined
    readonly context?: InjectionContext | undefined
    readonly visibility?: InjectionRegistration.VisibilityMode | undefined
  }
}

export class InjectionInitializer<T = any> {
  public static createClassInitializer<T extends CoreInitializer>(target: ConstructorType<T>, options?: InjectionInitializer.DeclarationOptions): InjectionInitializer<T> {
    const registration = InjectionRegistration.createClassRegistration(target, options)
    return new InjectionInitializer(registration)
  }

  public static createFactoryInitializer<T extends CoreInitializer>(target: FactoryType<T>, options?: InjectionInitializer.DeclarationOptions): InjectionInitializer<T> {
    const registration = InjectionRegistration.createFactoryRegistration(target, options)
    return new InjectionInitializer(registration)
  }

  private readonly registration: InjectionRegistration<CoreInitializer<T>>

  public get token() {
    return this.registration.token
  }

  public get visibility() {
    return this.registration.visibility
  }

  protected constructor(registration: InjectionRegistration<CoreInitializer<T>>) {
    this.registration = registration
  }

  public clone(options?: InjectionRegistration.DeclarationOptions): InjectionInitializer<T> {
    const registration = this.registration.clone(options)
    return new InjectionInitializer(registration)
  }

  public async initialize(...args: Parameters<typeof this.registration.resolve>): Promise<InjectionRegistration<T>> {
    const value = await this.registration.resolve(...args).initialize()
    return InjectionRegistration.createValueRegistration(value, {
      visibility: this.registration.visibility,
      token: this.registration.token,
    })
  }
}
