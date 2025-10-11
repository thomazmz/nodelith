import { Core } from '@refresh/framework/core'
import { Utils } from '@refresh/framework/utils'
import { InjectionRegistration } from './injection-registration'

export declare namespace InjectionInitializer {
  export type DeclarationTarget<T> = Utils.Constructor<Core.Initializer<T>>

  export type DeclarationOptions<T> = {
    token: InjectionRegistration.Token
    visibility?: InjectionRegistration.VisibilityMode
    initializer: DeclarationTarget<T>
  }
}

export class InjectionInitializer<T = any> implements Core.Initializer<InjectionRegistration<T>> {
  public static create<T>(options: InjectionInitializer.DeclarationOptions<T>): InjectionInitializer<T> {
    return new InjectionInitializer(options)
  }

  private readonly registration: InjectionRegistration<Core.Initializer<T>>

  private instance?: Core.Initializer<T> | undefined

  protected constructor(private readonly options: InjectionInitializer.DeclarationOptions<T>) {
    this.registration = InjectionRegistration.create({
      token: options.token,
      class: options.initializer,
      visibility: options.visibility,
    })
  }

  public clone(): InjectionInitializer<T> {
    return InjectionInitializer.create(this.options)
  }

  public async terminate(): Promise<void> {
    await this.instance?.terminate?.()
    this.instance = undefined
  }

  public async initialize(...params: Parameters<typeof this.registration.resolve>): Promise<InjectionRegistration<T>> {
    this.instance = this.registration.resolve(...params)
    return InjectionRegistration.create<T>({
      value: await this.instance.initialize(),
      visibility: this.registration.visibility,
      token: this.registration.token,
    })
  }
}
