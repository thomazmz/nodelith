import { CoreIdentity } from  '@nodelith/core'
import { UtilsFactory } from '@nodelith/utils'
import { UtilsFunction } from '@nodelith/utils'
import { UtilsConstructor } from '@nodelith/utils'
import { InjectionContext } from './injection-context'
import { InjectionBundle } from './injection-bundle'

export declare namespace InjectionRegistration {
  export type Token<T = any> = string & { __brand: T } | string

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
    | ValueOptions<T>
    | FunctionOptions<T>
    | ResolverOptions<T>
    | (T extends object ? ClassOptions<T> : never)
    | (T extends object ? FactoryOptions<T> : never)
  )

  export type ClassOptions<T extends object> = {
    class: UtilsConstructor<T>
    token?: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    resolution?: InjectionRegistration.ResolutionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
  }

  export type FactoryOptions<T extends object> = {
    factory: UtilsFactory<T>
    token?: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    resolution?: InjectionRegistration.ResolutionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
  }

  export type FunctionOptions<T> = {
    function: UtilsFunction<T>
    token?: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    resolution?: InjectionRegistration.ResolutionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
  }

  export type ResolverOptions<T> = {
    resolver: UtilsFunction<T>
    token?: InjectionRegistration.Token,
    parameters?: string[] | undefined
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    resolution?: InjectionRegistration.ResolutionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
  }

  export type ValueOptions<T> = {
    value: T
    token: InjectionRegistration.Token,
    context?: InjectionContext | undefined,
    lifecycle?: InjectionRegistration.LifecycleMode | undefined
    provision?: InjectionRegistration.ProvisionMode | undefined
    resolution?: InjectionRegistration.ResolutionMode | undefined
    visibility?: InjectionRegistration.VisibilityMode | undefined
  }
}

export interface InjectionRegistration<T = any> {
  clone(options?: InjectionRegistration.CloningOptions): InjectionRegistration<T> 
  resolve(options?: InjectionRegistration.ResolutionOptions): T
}

export class InjectionRegistration<T = any> {
  public static readonly DEFAULT_LIFECYCLE_MODE: InjectionRegistration.LifecycleMode = 'singleton'
  
  public static readonly DEFAULT_PROVISION_MODE: InjectionRegistration.ProvisionMode = 'parameters'

  public static readonly DEFAULT_VISIBILITY_MODE: InjectionRegistration.VisibilityMode = 'public'
  
  public static readonly DEFAULT_RESOLUTION_MODE: InjectionRegistration.ResolutionMode = 'proxy'

  public static readonly LIFECYCLE_MODES = ['singleton', 'transient', 'scoped'] as const
  
  public static readonly PROVISION_MODES = ['parameters', 'bundle'] as const
  
  public static readonly VISIBILITY_MODES = ['public', 'private'] as const

  public static readonly RESOLUTION_MODES = ['proxy', 'eager'] as const

  protected static proxy<T extends object = any>(resolver: UtilsFunction<T>, prototype?: object): UtilsFunction<T> {
    let instance: undefined | T = undefined
  
    const getInstance = (args: any[]): T => {
      return instance ? instance : instance = resolver(...args)
    }
  
    return CoreIdentity.bind(resolver, (...args: any[]) => {
      return new Proxy<T>(Object.create(prototype ?? null), {
        get(_target, property, receiver) {
          const instance = getInstance(args)
          return Reflect.get(instance, property, receiver)
        },
        set(_target, property, value, receiver) {
          const instance = getInstance(args)
          return Reflect.set(instance, property, value, receiver)
        },
        has(_target, property) {
          const instance = getInstance(args)
          return Reflect.has(instance, property)
        },
        ownKeys(_target) {
          const instance = getInstance(args)
          return Reflect.ownKeys(instance)
        },
        getPrototypeOf(_target) {
          const instance = getInstance(args)
          return Reflect.getPrototypeOf(instance)
        },
        getOwnPropertyDescriptor(_target, property) {
          const instance = getInstance(args)
          return Reflect.getOwnPropertyDescriptor(instance, property)
        },
      })
    })
  }

  protected static createClassResolver<T extends object = any>(target: UtilsConstructor<T>) {
    return CoreIdentity.bind(target, (...args: any[]) => new target(...args))
  }

  protected static createClassResolverProxy<T extends object = any>(target: UtilsConstructor<T>) {
    return InjectionRegistration.proxy(this.createClassResolver(target), target?.prototype)
  }

  protected static createFactoryResolver<T extends object>(target: UtilsFactory<T>) {
    return CoreIdentity.bind(target, (...args: any[]) => target(...args))
  }

  protected static createFactoryResolverProxy<T extends object>(target: UtilsFactory<T>) {
    return InjectionRegistration.proxy(this.createFactoryResolver(target), target?.prototype)
  }

  protected static createFunctionResolver<T = any >(target: UtilsFunction<T>) {
    return CoreIdentity.bind(target, (...args: any[]) => target(...args))
  }

  protected static createValueResolver<T = any >(value: T) {
    const resolver = () => value
    CoreIdentity.assign(resolver)
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
    this.visibility = options.visibility ?? InjectionRegistration.DEFAULT_VISIBILITY_MODE
    this.resolution = options.resolution ?? InjectionRegistration.DEFAULT_RESOLUTION_MODE
    this.lifecycle = options.lifecycle ?? InjectionRegistration.DEFAULT_LIFECYCLE_MODE
    this.provision = options.provision ?? InjectionRegistration.DEFAULT_PROVISION_MODE
    this.context = options.context ?? InjectionContext.create()

    if('value' in options ) {
      this.resolver = InjectionRegistration.createValueResolver(options.value)
      this.token = options.token ?? CoreIdentity.obtain(this.resolver)
      return
    }

    if('resolver' in options) {
      this.resolver = options.resolver
      this.parameters = options.parameters,
      this.token = options.token ?? CoreIdentity.obtain(this.resolver)
      return
    }

    if('function' in options ) {
      this.resolver = InjectionRegistration.createFunctionResolver(options.function)
      this.parameters = UtilsFunction.extractParameters(options.function)
      this.token = options.token ?? CoreIdentity.obtain(this.resolver)
      return 
    }

    if('factory' in options) {
      this.parameters = UtilsFactory.extractParameters(options.factory)
      this.token = options.token ?? CoreIdentity.obtain(options.factory)

      if(this.resolution === 'proxy') {
        this.resolver = InjectionRegistration.createFactoryResolverProxy(options.factory)
        return
      }

      if(this.resolution === 'eager') {
        this.resolver = InjectionRegistration.createFactoryResolver(options.factory)
        return
      }
    }

    if('class' in options) {
      this.parameters = UtilsConstructor.extractParameters(options.class)
      this.token = options.token ?? CoreIdentity.obtain(options.class)

      if(this.resolution === 'proxy') {
        this.resolver = InjectionRegistration.createClassResolverProxy(options.class)
        return
      }

      if(this.resolution === 'eager') {
        this.resolver = InjectionRegistration.createClassResolver(options.class)
        return
      }
    }

    throw new Error(`Could not create registration. Invalid options provided: ${JSON.stringify(options)}`)
  }
  
  private readonly resolver: UtilsFunction<T>
  
  private readonly context: InjectionContext
  
  private readonly parameters: string[] | undefined

  public readonly token: InjectionRegistration.Token<T>

  public readonly lifecycle: InjectionRegistration.LifecycleMode

  public readonly provision: InjectionRegistration.ProvisionMode

  public readonly resolution: InjectionRegistration.ResolutionMode

  public readonly visibility: InjectionRegistration.VisibilityMode

  public clone(options?: {
    context?: InjectionContext | undefined,
  }): InjectionRegistration<T> {
    return new InjectionRegistration<T>({
      context: options?.context ?? this.context,
      token: this.token,
      resolver: this.resolver,
      lifecycle: this.lifecycle,
      provision: this.provision,
      resolution: this.resolution,
      visibility: this.visibility,
      parameters: this.parameters,
    })
  }

  public resolve(options?: InjectionRegistration.ResolutionOptions): T {
    const context = options?.context ?? InjectionContext.create()
    const bundle = options?.bundle ?? InjectionBundle.create()

    const args = this.provision === 'bundle' ? [bundle] : (
      this.parameters?.map(parameter => bundle[parameter]) ?? []
    )

    if(this.lifecycle === 'singleton') {
      return this.context.resolve(this.resolver, ...args)
    }

    if(this.lifecycle === 'scoped') {
      return context.resolve(this.resolver, ...args)
    }

    if(this.lifecycle === 'transient') {
      return this.resolver(...args)
    }

    throw new Error(`Could not resolve registration. Invalid "${this.lifecycle}" lifecycle.`)
  }
}