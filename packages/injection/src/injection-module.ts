import { InjectionRegistration } from './injection-registration'
import { InjectionContainer } from './injection-container'
import { InjectionContext } from './injection-context'
import { InjectionTrace } from './injection-trace'

export declare namespace InjectionModule {
  export type DeclarationOptions = {
    context: InjectionContext
    stack: InjectionTrace
  }
}

export class InjectionModule extends InjectionContainer {
  public static override create(options?: Partial<InjectionModule.DeclarationOptions>): InjectionModule {
    return new InjectionModule({
      stack: options?.stack ?? InjectionTrace.create(),
      context: options?.context ?? InjectionContext.create(),
    })
  }

  private readonly _modules: Set<InjectionModule> = new Set()

  protected get modules() {
    return [...this._modules]
  }

  protected hasModule(module: InjectionModule) {
    return this._modules.has(module)
  }

  protected addModule(module: InjectionModule) {
    return this._modules.add(module)
  }

  protected override get entries(): [string, InjectionRegistration][] {
    return [...this.modules.flatMap((module) => {
      return module.entries
    }), ...super.entries]
  }

  protected findRegistration(token: string): InjectionRegistration | undefined {
    if (this.hasRegistration(token)) {
      return this['getRegistration'](token)
    }

    for (const module of this.modules) {
      const registration = module.findRegistration(token)
      if (registration) {
        return registration
      }
    }

    return undefined
  }

  public useModules(modules: InjectionModule[]): this {
    modules.forEach((module) => this.useModule(module))
    return this
  }

  public useModule(module: InjectionModule): this {
    this.addModule(module.clone({ context: this.context }))
    return this
  }

  public override resolve<T>(token: string, options?: InjectionRegistration.ResolutionOptions): T {
    const registration = this.findRegistration(token)

    if (!registration) {
      throw new Error(`Could not get registration with token "${token}". InjectionModule instance does not have a registration for the specified token.`)
    }

    return this.resolveRegistration(registration, options)
  }

  public clone(options?: Partial<InjectionModule.DeclarationOptions>): InjectionModule {
    const module = InjectionModule.create(options)
    module.useRegistrations(this.registrations)
    module.useModules(this.modules)
    return module
  }
}
