import { InjectionBundle } from './injection-bundle'
import { InjectionContext } from './injection-context'
import { Utils } from '@refresh/framework/utils'
import { Core } from  '@refresh/framework/core'

export declare namespace InjectionRegistration {
  export type Token<T = any> = string & { [InjectionRegistration.TOKEN_KEY]: T } | string

  export type ResolutionMode = (typeof InjectionRegistration.RESOLUTION_MODES)[number]

  export type VisibilityMode = (typeof InjectionRegistration.VISIBILITY_MODES)[number]

  export type ProvisionMode = (typeof InjectionRegistration.PROVISION_MODES)[number]

  export type LifecycleMode = (typeof InjectionRegistration.LIFECYCLE_MODES)[number]

  export type ResolutionOptions = {
    context?: InjectionContext | undefined
    bundle?: InjectionBundle | undefined
  }

  export type CloningOptions = {
    context?: InjectionContext | undefined
  }

  export type DeclarationOptions<T> = (
    | (T extends object ? ValueOptions<T> : never)
    | (T extends object ? ClassOptions<T> : never)
    | (T extends object ? FactoryOptions<T> : never)
    | (T extends object ? FunctionOptions<T> : never)
  )

  export type ClassOptions<T extends object> = {
    token?: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    resolution?: InjectionRegistration.ResolutionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
    class: Utils.Constructor<T>
  }

  export type FactoryOptions<T extends object> = {
    token?: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    resolution?: InjectionRegistration.ResolutionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
    factory: Utils.Factory<T>
  }

  export type FunctionOptions<T> = {
    token?: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
    function: Utils.Function<T>
  }

  export type ValueOptions<T> = {
    token: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    visibility?: InjectionRegistration.VisibilityMode | undefined
    value: T
  }
}

export interface InjectionRegistration<T = any> {
  clone(options?: InjectionRegistration.CloningOptions): InjectionRegistration<T> 
  resolve(options?: InjectionRegistration.ResolutionOptions): T
}

export class InjectionRegistration<T = any> {
  public static readonly DEFAULT_PROVISION_MODE: InjectionRegistration.ProvisionMode = 'parameters'

  public static readonly DEFAULT_LIFECYCLE_MODE: InjectionRegistration.LifecycleMode = 'singleton'

  public static readonly DEFAULT_VISIBILITY_MODE: InjectionRegistration.VisibilityMode = 'public'
  
  public static readonly DEFAULT_RESOLUTION_MODE: InjectionRegistration.ResolutionMode = 'proxy'

  public static readonly PROVISION_MODES = ['parameters', 'bundle'] as const
  
  public static readonly LIFECYCLE_MODES = ['singleton', 'transient', 'scoped'] as const
  
  public static readonly VISIBILITY_MODES = ['private', 'public'] as const

  public static readonly RESOLUTION_MODES = ['eager', 'proxy'] as const

  public static readonly TOKEN_KEY = Symbol('__token')

  protected static createClassResolver<T extends object = any>(options: InjectionRegistration.ClassOptions<T>) {
    return Core.Identity.bind(options.class, (...args: any[]) => new options.class(...args))
  }

  protected static createFactoryResolver<T extends object>(options: InjectionRegistration.FactoryOptions<T>) {
    return Core.Identity.bind(options.factory, (...args: any[]) => options.factory(...args))
  }

  protected static createFunctionResolver<T = any >(options: InjectionRegistration.FunctionOptions<T>) {
    return Core.Identity.bind(options.function, (...args: any[]) => options.function(...args))
  }

  protected static createValueResolver<T = any >(options: InjectionRegistration.ValueOptions<T>) {
    const resolver = () => options.value
    Core.Identity.assign(resolver)
    return resolver
  }

  public static create<T extends object>(options: InjectionRegistration.ClassOptions<T>): InjectionRegistration<T>;
  public static create<T extends object>(options: InjectionRegistration.FactoryOptions<T>): InjectionRegistration<T>;
  public static create<T>(options: InjectionRegistration.FunctionOptions<T>): InjectionRegistration<T>;
  public static create<T>(options: InjectionRegistration.ValueOptions<T>): InjectionRegistration<T>;
  public static create<T>(options: any): InjectionRegistration<T> { 
    return new InjectionRegistration<T>(options);
   }

  protected constructor(options: InjectionRegistration.DeclarationOptions<T>) {
    this.context = options.context ?? InjectionContext.create()
    this.options = options

    if('value' in options ) {
      this.resolver = InjectionRegistration.createValueResolver(options)
      this.token = options.token ?? Core.Identity.obtain(this.resolver)
      this.visibility = options.visibility ?? InjectionRegistration.DEFAULT_VISIBILITY_MODE
    }

    if('function' in options ) {
      this.resolver = InjectionRegistration.createFunctionResolver(options)
      this.token = options.token ?? Core.Identity.obtain(this.resolver)
      this.lifecycle = options.lifecycle ?? InjectionRegistration.DEFAULT_LIFECYCLE_MODE
      this.provision = options.provision ?? InjectionRegistration.DEFAULT_PROVISION_MODE
      this.visibility = options.visibility ?? InjectionRegistration.DEFAULT_VISIBILITY_MODE
      this.parameters = this.provision === 'parameters'
        ? Utils.Function.extractParameters(options.function)
        : undefined
    }

    if('factory' in options) {
      this.resolver = InjectionRegistration.createFactoryResolver(options)
      this.token = options.token ?? Core.Identity.obtain(this.resolver)
      this.lifecycle = options.lifecycle ?? InjectionRegistration.DEFAULT_LIFECYCLE_MODE
      this.provision = options.provision ?? InjectionRegistration.DEFAULT_PROVISION_MODE
      this.resolution = options.resolution ?? InjectionRegistration.DEFAULT_RESOLUTION_MODE 
      this.visibility = options.visibility ?? InjectionRegistration.DEFAULT_VISIBILITY_MODE
      this.parameters = this.provision === 'parameters'
        ? Utils.Factory.extractParameters(options.factory)
        : undefined
    }

    if('class' in options) {
      this.resolver = InjectionRegistration.createClassResolver(options)
      this.token = options.token ?? Core.Identity.obtain(this.resolver)
      this.lifecycle = options.lifecycle ?? InjectionRegistration.DEFAULT_LIFECYCLE_MODE
      this.provision = options.provision ?? InjectionRegistration.DEFAULT_PROVISION_MODE
      this.visibility = options.visibility ?? InjectionRegistration.DEFAULT_VISIBILITY_MODE
      this.resolution = options.resolution ?? InjectionRegistration.DEFAULT_RESOLUTION_MODE 
      this.parameters = this.provision === 'parameters'
        ? Utils.Constructor.extractParameters(options.class)
        : undefined
    }
  }
  
  private readonly resolver: (...args: any[]) => T
  
  private readonly context: InjectionContext
  
  private readonly options: InjectionRegistration.DeclarationOptions<T>
  
  private readonly parameters: string[] | undefined

  public readonly token: InjectionRegistration.Token<T>

  public readonly lifecycle: InjectionRegistration.LifecycleMode

  public readonly provision: InjectionRegistration.ProvisionMode

  public readonly resolution: InjectionRegistration.ResolutionMode

  public readonly visibility: InjectionRegistration.VisibilityMode

  public clone(options?: {
    context?: InjectionContext | undefined,
  }): InjectionRegistration<T> {
    return new InjectionRegistration<T>({ ...this.options,
      context: options?.context ?? this.context
    })
  }

  public resolve(options?: InjectionRegistration.ResolutionOptions): T {
    const context = options?.context ?? InjectionContext.create()
    const bundle = options?.bundle ?? InjectionBundle.create()

    const argumentz = this.parameters?.map(parameter => {
      return bundle[parameter]
    }) ?? [bundle]

    if(this.lifecycle === 'singleton') {
      return this.context.resolve(this.resolver, ...argumentz)
    }

    if(this.lifecycle === 'scoped') {
      return context.resolve(this.resolver, ...argumentz)
    }

    if(this.lifecycle === 'transient') {
      return this.resolver(...argumentz)
    }

    throw new Error(`Could not resolve registration. Invalid "${this.lifecycle}" lifecycle.`)
  }
}
