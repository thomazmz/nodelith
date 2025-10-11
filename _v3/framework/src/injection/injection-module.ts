import { Core } from '@refresh/framework/core'
import { InjectionBundle } from './injection-bundle';
import { InjectionContext } from './injection-context';
import { InjectionContainer } from './injection-container';
import { InjectionInitializer } from './injection-initializer';
import { InjectionRegistration } from './injection-registration';

export class InjectionModule extends InjectionContainer implements Core.Initializer {

  public static create(context?: InjectionContext): InjectionModule {
    return new InjectionModule(context ?? InjectionContext.create())
  }

  protected readonly modules: Set<InjectionModule> = new Set()
  
  protected readonly initializers: Set<InjectionInitializer> = new Set()

  protected get entries(): [InjectionRegistration.Token, InjectionRegistration][] {
    const entries = [...this.modules].flatMap(module => {
      return module.entries.filter(([_token, registration]) => {
        return registration.visibility === 'public'
      })
    })

    return [ ...entries, ...super.entries ]
  }

  public useModule(module: InjectionModule): void {
    this.modules.add(module.clone(this.context))
  }

  public useModules(modules: InjectionModule[]): void {
    modules.forEach((module) => this.useModule(module))
  }

  public useInitializer<T>(initializer: InjectionInitializer<T>): void {
    this.initializers.add(initializer.clone())
  }

  public useInitializers(initializers: InjectionInitializer[]): void {
    initializers.forEach(initializer => this.useInitializer(initializer))
  }

  public clone(context?: InjectionContext | undefined): InjectionModule {
    const module = InjectionModule.create(context)
    module.useModules([...this.modules.values()])
    module.useInitializers([...this.initializers.values()])
    module.useRegistrations([...this.registrations.values()])
    return module
  }

  public registerInitializer<T>(token: InjectionRegistration.Token, target: InjectionInitializer.DeclarationTarget<T>, options?: Omit<InjectionInitializer.DeclarationOptions<T>, 'initializer' | 'token'>): void {
    this.useInitializer(InjectionInitializer.create({ ...options, token, initializer: target }))
  }

  public register<T extends object>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.FactoryOptions<T>, 'token'>): void

  public register<T extends object>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.ClassOptions<T>, 'token'>): void
 
  public register<T>(token: InjectionRegistration.Token, options: Omit<InjectionInitializer.DeclarationOptions<T>, 'token'>): void;

  public register<T>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.FunctionOptions<T>, 'token'>): void

  public register<T>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.ValueOptions<T>, 'token'>): void

  public register<T>(token: InjectionRegistration.Token, options: any): void {
    'initializer' in options
      ? this.useInitializer(InjectionInitializer.create({ ...options, token }))
      : super.register(token, options)
  }

  public async initialize(options?: InjectionRegistration.ResolutionOptions): Promise<void> {
    if(!options?.context) {
      return this.initialize({...options,
        context: InjectionContext.create()
      })
    }

    for await (const module of this.modules) {
      await module.initialize({
        context: options.context,
        bundle: InjectionBundle.create({
          context: options.context,
          bundle: options.bundle,
          entries: this.entries,
        }),
      })
    }

    for await (const initializer of this.initializers) {
      this.useRegistration((await initializer.initialize({
        context: options.context,
        bundle: InjectionBundle.create({
          context: options.context,
          bundle: options.bundle,
          entries: this.entries,
        }),
      })))
    }
  }

  public async terminate(): Promise<void> {
    for await (const module of this.modules) {
      await module.terminate()
    }

    for await (const initializer of this.initializers) {
      await initializer.terminate()
    }
  }
}
