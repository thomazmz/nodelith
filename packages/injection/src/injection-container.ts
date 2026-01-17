import { ConstructorType } from '@nodelith/utilities'
import { FunctionType } from '@nodelith/utilities'
import { FactoryType } from '@nodelith/utilities'
import { CoreInitializer } from '@nodelith/core'

import { InjectionRegistration } from './injection-registration'
import { InjectionInitializer } from './injection-initializer'
import { InjectionContext } from './injection-context'
import { InjectionBundle } from './injection-bundle'
import { InjectionTrace } from './injection-trace'
import { InjectionEntry } from './injection-entry'

export declare namespace InjectionContainer {
  export type DeclarationOptions = {
    context: InjectionContext
    stack: InjectionTrace
  }
}

export class InjectionContainer {
  public static create(options?: Partial<InjectionContainer.DeclarationOptions>): InjectionContainer {
    return new InjectionContainer({
      stack: options?.stack ?? InjectionTrace.create(),
      context: options?.context ?? InjectionContext.create(),
    })
  }

  private readonly _registrations: Map<string, InjectionRegistration>
  
  private readonly _initializers: Map<string, InjectionInitializer>

  protected readonly context: InjectionContext;

  protected readonly trace: InjectionTrace;

  protected constructor(options: InjectionContainer.DeclarationOptions) {
    this._registrations = new Map()
    this._initializers = new Map()
    this.context = options.context
    this.trace = options.stack
  }

  protected hasRegistration(token: string): boolean {
    return this._registrations.has(token)
  }

  protected hasInitializer(token: string): boolean {
    return this._initializers.has(token)
  }

  protected get registrations(): InjectionRegistration[] {
    return [ ...this._registrations.values() ]
  }

  protected get initializers(): InjectionInitializer[] {
    return [ ...this._initializers.values() ]
  }

  protected get entries(): InjectionEntry[] {
    return this.registrations.map((registration) => {
      return [registration.token, Object.create(registration, {
        resolve: { value: (...options: Parameters<InjectionRegistration['resolve']>) => {
          return this.resolve(registration.token, ...options )
        }}
      })]
    })
  }

  protected getRegistration(token: string): InjectionRegistration {
    if(!this.hasRegistration(token)) {
      throw new Error(`Could not get registration with token "${token}". InjectionContainer instance does not have a registration for the specified token.`)
    }

    return this._registrations.get(token)!
  }

  protected getInitializer(token: string): InjectionInitializer {
    if(!this.hasInitializer(token)) {
      throw new Error(`Could not get initializer with token "${token}". InjectionContainer instance does not have a initializer for the specified token.`)
    }

    return this._initializers.get(token)!
  }

  protected setRegistration(registration: InjectionRegistration): void {
    if(this.hasRegistration(registration.token)) {
      throw new Error(`Could not set registration with token "${registration.token}". InjectionContainer instance already has a registration for the specified token.`)
    }

    this._registrations.set(registration.token, registration)
  }

  protected setInitializer(initializer: InjectionInitializer): void {
    if(this.hasInitializer(initializer.token)) {
      throw new Error(`Could not set initializer with token "${initializer.token}". InjectionContainer instance already has a initializer for the specified token.`)
    }

    this._initializers.set(initializer.token, initializer)
  }

  public useRegistrations(registrations: InjectionRegistration[]) {
    registrations.forEach((registration) => this.useRegistration(registration))
    return this
  }

  public useRegistration(registration: InjectionRegistration) {
    this.setRegistration(registration.clone({ context: this.context }))
    return this
  }

  public useInitializers(initializers: InjectionInitializer[]) {
    initializers.forEach((initializer) => this.useInitializer(initializer))
    return this
  }

  public useInitializer(initializer: InjectionInitializer) {
    this.setInitializer(initializer.clone({ context: this.context }))
    return this
  }

  public useValueRegistration<T>(...args: Parameters<typeof InjectionRegistration.createValueRegistration<T>>): this {
    return this.useRegistration(InjectionRegistration.createValueRegistration(...args))
  }

  public useFunctionRegistration<T>(...args: Parameters<typeof InjectionRegistration.createFunctionRegistration<T>>): this {
    return this.useRegistration(InjectionRegistration.createFunctionRegistration(...args))
  }

  public useFactoryRegistration<T extends object>(...args: Parameters<typeof InjectionRegistration.createFactoryRegistration<T>>): this {
    return this.useRegistration(InjectionRegistration.createFactoryRegistration(...args))
  }

  public useClassRegistration<T extends object>(...args: Parameters<typeof InjectionRegistration.createClassRegistration<T>>): this {
    return this.useRegistration(InjectionRegistration.createClassRegistration(...args))
  }

  public useFactoryInitializer<T extends CoreInitializer<object>>(...args: Parameters<typeof InjectionInitializer.createFactoryInitializer<T>>): this {
    return this.useInitializer(InjectionInitializer.createFactoryInitializer(...args))
  }

  public useClassInitializer<T extends CoreInitializer<object>>(...args: Parameters<typeof InjectionInitializer.createClassInitializer<T>>): this {
    return this.useInitializer(InjectionInitializer.createClassInitializer(...args))
  }

  public mapValueRegistration<T>(token: string, target: T, options?: Omit<InjectionRegistration.ValueOptions, 'token'>): this {
    return this.useValueRegistration(target, { ...options, token })
  }

  public mapFunctionRegistration<T>(token: string, target: FunctionType<T>, options?: Omit<InjectionRegistration.FunctionOptions, 'token'>): this {
    return this.useFunctionRegistration(target, { ...options, token })
  }

  public mapFactoryRegistration<T extends object>(token: string, target: FactoryType<T>, options?: Omit<InjectionRegistration.FactoryOptions, 'token'>): this {
    return this.useFactoryRegistration(target, { ...options, token })
  }

  public mapClassRegistration<T extends object>(token: string, target: ConstructorType<T>, options?: Omit<InjectionRegistration.ClassOptions, 'token'>): this {
    return this.useClassRegistration(target, { ...options, token })
  }

  public mapFactoryInitializer<T extends CoreInitializer>(token: string, target: FactoryType<T>, options?: Omit<InjectionInitializer.DeclarationOptions, 'token'>): this {
    return this.useFactoryInitializer(target, { ...options, token })
  }

  public mapClassInitializer<T extends CoreInitializer>(token: string, target: ConstructorType<T>, options?: Omit<InjectionInitializer.DeclarationOptions, 'token'>): this {
    return this.useClassInitializer(target, { ...options, token })
  }

  public async initialize(options?: InjectionRegistration.ResolutionOptions): Promise<void> {
    for await (const initializer of this.initializers) {
      const registration = await initializer.initialize(options)
      this.setRegistration(registration)
    }
  }

  public resolve<T>(token: string, options?: InjectionRegistration.ResolutionOptions): T {
    return this.resolveRegistration(this.getRegistration(token), options)
  }

  public resolveClass<T extends object>(target: ConstructorType<T>, options?: InjectionRegistration.ResolutionOptions): T {
    return this.resolveRegistration(InjectionRegistration.createClassRegistration(target), options)
  }

  public resolveFactory<T extends object>(target: FactoryType<T>, options?: InjectionRegistration.ResolutionOptions): T {
    return this.resolveRegistration(InjectionRegistration.createFactoryRegistration(target), options)
  }

  public resolveFunction<T>(target: FunctionType<T>, options?: InjectionRegistration.ResolutionOptions): T {
    return this.resolveRegistration(InjectionRegistration.createFunctionRegistration<T>(target), options)
  }

  public resolveRegistration<T>(registration: InjectionRegistration<T>, options?: InjectionRegistration.ResolutionOptions): T {
    if(!options?.context) {
      return this.resolveRegistration(registration, { ...options,
        context: InjectionContext.create()
      })
    }

    return registration.resolve({
      context: options.context,
      bundle: InjectionBundle.create({
        context: options.context,
        bundle: options.bundle,
        entries: this.entries,
      }),
    })
  }
}
