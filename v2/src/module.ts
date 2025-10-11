import { ResolverConstructorOptions, ResolverFactoryOptions, Resolver, ResolverOptions } from './resolver'
import { Container, ContainerDeclarationOptions, ContainerResolutionOptions } from './container'
import { Registration, RegistrationDeclarationOptions } from './registration'
import { TargetConstructor, TargetFactory } from './target'
import { Bundle, BundleDescriptorEntry } from './bundle'
import { Context } from './context'
import { Token } from './token'

export type ModuleDeclarationOptions = ContainerDeclarationOptions

export type ModuleResolutionOptions = ContainerResolutionOptions

export type ModuleRegistrationVisibility = 'private' | 'public'

type ModuleRegistrationOptions = RegistrationDeclarationOptions & {
  visibility?: ModuleRegistrationVisibility
}

class ModuleRegistration<T = any> extends Registration<T> {
  private static DEFAULT_VISIBILITY: ModuleRegistrationVisibility = 'public'

  public static create<T = any>(options: ModuleRegistrationOptions & ResolverOptions<T>) {
    const resolver = Resolver.create(options)
    return new ModuleRegistration(resolver, options)
  }

  public readonly visibility: ModuleRegistrationVisibility
  
  protected constructor(resolver: Resolver<T>, options?: ModuleRegistrationOptions) {
    super(resolver, options)
    this.visibility = options?.visibility ?? ModuleRegistration.DEFAULT_VISIBILITY
  }

  public clone(options?: ModuleRegistrationOptions): Registration<T> {
    return new ModuleRegistration(this.resolver, {
      lifecycle: this.lifecycle,
      context: options?.context ?? this.context,
      visibility: options?.visibility ?? this.visibility,
    })
  }
}

export class Module {
  private readonly _modules = new Set<Module>()
  
  private readonly _container: Container<ModuleRegistration>
  
  private readonly _context: Context

  public get registrations(): Readonly<Registration[]> {
    return this._container.registrations.filter(registration => {
      return registration.visibility === 'public'
    })
  }

  public get entries(): Readonly<[Token, ModuleRegistration][]> {
    return this._container.entries.filter(([_token, registration]) => {
      return registration.visibility === 'public'
    })    
  }

  public get modules(): Module[] {
    return [...this._modules]
  }

  public constructor(options?: ModuleDeclarationOptions) {
    this._context = options?.context ?? Context.create()
    this._container = Container.create( {context: this._context })
  }

  public exposes(token: Token): boolean {
    return !!(this._container.get(token)?.visibility === 'public')
  }

  public import (module: Module): void {
    const clone = module.clone({ context: this._context })
    this._modules.add(clone)
  }

  public clone(options?: ModuleDeclarationOptions): Module {
    const module = new Module(options)
    module.setRegistrations(...this._container.entries)
    return module
  }

  public register<R extends object>(token: Token, options: (
    ModuleRegistrationOptions & ResolverFactoryOptions<R>
  )): void 

  public register<R extends object>(token: Token, options: (
    ModuleRegistrationOptions & ResolverConstructorOptions<R>
  )): void 

  public register<R extends object>(token: Token, options: (
    ModuleRegistrationOptions & ResolverOptions<R>
  )): void {
    const registration = ModuleRegistration.create({ ...options })
    this.setRegistration(token, registration)
  }

  public registerFactory<R extends object>(token: Token, factory: TargetFactory, options?: (
    ModuleRegistrationOptions & Omit<ResolverFactoryOptions<R>, 'factory'>
  )): void {
    const registration = ModuleRegistration.create({ ...options, factory })
    this.setRegistration(token, registration)
  }

  public registerConstructor<R extends object>(token: Token, constructor: TargetConstructor, options?: (
    ModuleRegistrationOptions & Omit<ResolverConstructorOptions<R>, 'constructor'>
  )): void {
    const registration = ModuleRegistration.create({ ...options, constructor })
    this.setRegistration(token, registration)
  }

  protected setRegistrations<R extends object>(...entries: [token: Token, registration: ModuleRegistration<R>][]): void {
    entries.forEach(entry => this.setRegistration(...entry))
  }
  
  protected setRegistration<R extends object>(token: Token, registration: ModuleRegistration<R>): void {
    if (this._container.has(token)) {
      throw new Error(`Could not register token "${token.toString()}". Module already contains a registration assigned to the same token.`)
    }

    this._container.register(token, registration)
  }

  public resolve<T>(token: Token, options?: ModuleResolutionOptions): T {
    if(!this._container.has(token)) {
      throw new Error(`Could not resolve token "${token.toString()}". Module does not contain a registration associated to the given token.`)
    }

    if(!this.exposes(token)) {
      throw new Error(`Could not resolve token "${token.toString()}". Module does not expose a registration associated to the given token.`)
    }

    const resolutionContext = options?.context ?? Context.create()

    const resolutionEntries = this.modules.flatMap((module): BundleDescriptorEntry[] => {
      return module.entries.map(([token, registration]): BundleDescriptorEntry => [token, {
        resolve: (bundle: Bundle) => registration.resolve({ 
          context: options?.context ?? Context.create(),
          bundle 
        })
      }])
    })

    const resolutionBundle = Bundle.create(...resolutionEntries)

    return this._container.resolve(token, {
      context: resolutionContext,
      bundle: resolutionBundle,
    })
  }
}
