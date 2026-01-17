import { ConstructorUtilities } from '@nodelith/utilities'
import { FunctionUtilities } from '@nodelith/utilities'
import { FactoryUtilities } from '@nodelith/utilities'
import { ConstructorType } from '@nodelith/utilities'
import { FunctionType } from '@nodelith/utilities'
import { FactoryType } from '@nodelith/utilities'
import { Identity } from  '@nodelith/identity'

import { InjectionResolver } from './injection-resolver'
import { InjectionContext } from './injection-context'
import { InjectionBundle } from './injection-bundle'

export declare namespace InjectionRegistration {
  export type VisibilityMode = (typeof InjectionRegistration.VISIBILITY_MODES)[number]

  export type LifecycleMode = (typeof InjectionRegistration.LIFECYCLE_MODES)[number]

  export type ResolutionOptions = DeclarationOptions & {
    readonly bundle?: InjectionBundle | undefined
  }

  export type DeclarationOptions = {
    readonly context?: InjectionContext | undefined
  }

  export type ValueOptions = {
    readonly token?: string | undefined
    readonly visibility?: InjectionRegistration.VisibilityMode | undefined
  }

  export type FunctionOptions = { 
    readonly token?: string | undefined
    readonly params?: string[] | undefined
    readonly context?: InjectionContext | undefined
    readonly lifecycle?: InjectionRegistration.LifecycleMode | undefined
    readonly visibility?: InjectionRegistration.VisibilityMode | undefined
  }

  export type ClassOptions = {
    readonly token?: string | undefined
    readonly params?: string[] | undefined
    readonly context?: InjectionContext | undefined
    readonly lifecycle?: InjectionRegistration.LifecycleMode | undefined
    readonly visibility?: InjectionRegistration.VisibilityMode | undefined
  }

  export type FactoryOptions = {
    readonly token?: string | undefined
    readonly params?: string[] | undefined
    readonly context?: InjectionContext | undefined
    readonly lifecycle?: InjectionRegistration.LifecycleMode | undefined
    readonly visibility?: InjectionRegistration.VisibilityMode | undefined
  }
}

export interface InjectionRegistration<T = any> {
  clone(options?: InjectionRegistration.DeclarationOptions): InjectionRegistration<T> 
  resolve(options?: InjectionRegistration.ResolutionOptions): T
}

export class InjectionRegistration<T = any> {
  public static createValueRegistration<T>(target: T, options?: InjectionRegistration.ValueOptions) {
    return new InjectionRegistration(InjectionResolver.createValueResolver(target), options)
  }

  public static createFunctionRegistration<T>(target: FunctionType<T>, options?: InjectionRegistration.FunctionOptions) {
    return new InjectionRegistration(InjectionResolver.createFunctionResolver<T>(target), { ...options,
      params: options?.params ?? FunctionUtilities.extractParameters(target)
    })
  }

  public static createClassRegistration<T extends object>(target: ConstructorType<T>, options?: InjectionRegistration.ClassOptions) {
    return new InjectionRegistration(InjectionResolver.createClassResolver<T>(target), { ...options,
      params: options?.params ?? ConstructorUtilities.extractParameters(target)
    })
  }

  public static createFactoryRegistration<T extends object>(target: FactoryType<T>, options?: InjectionRegistration.FactoryOptions) {
    return new InjectionRegistration(InjectionResolver.createFactoryResolver<T>(target), { ...options,
      params: options?.params ?? FactoryUtilities.extractParameters(target)
    })
  }

  public static readonly DEFAULT_LIFECYCLE_MODE: InjectionRegistration.LifecycleMode = 'singleton'

  public static readonly DEFAULT_VISIBILITY_MODE: InjectionRegistration.VisibilityMode = 'public'

  public static readonly LIFECYCLE_MODES = ['singleton', 'transient', 'scoped'] as const
  
  public static readonly VISIBILITY_MODES = ['public', 'private'] as const

  private readonly resolver: FunctionType<T>
  
  private readonly context: InjectionContext
  
  public readonly token: string
  
  public readonly params: string[]

  public readonly lifecycle: InjectionRegistration.LifecycleMode

  public readonly visibility: InjectionRegistration.VisibilityMode

  protected constructor(resolver: FunctionType<T>, options?: {
    readonly token?: string | undefined
    readonly params?: string[] | undefined
    readonly context?: InjectionContext | undefined
    readonly lifecycle?: InjectionRegistration.LifecycleMode | undefined
    readonly visibility?: InjectionRegistration.VisibilityMode | undefined
  }) {
    this.resolver = resolver
    this.params = options?.params ?? []
    this.token = options?.token ?? Identity.obtain(resolver)
    this.context = options?.context ?? InjectionContext.create()
    this.lifecycle = options?.lifecycle ?? InjectionRegistration.DEFAULT_LIFECYCLE_MODE
    this.visibility = options?.visibility ?? InjectionRegistration.DEFAULT_VISIBILITY_MODE
  }

  public clone(options?: InjectionRegistration.DeclarationOptions): InjectionRegistration<T> {
    return new InjectionRegistration<T>(this.resolver, {
      context: options?.context ?? this.context,
      token: this.token,
      params: this.params,
      lifecycle: this.lifecycle,
      visibility: this.visibility,
    })
  }

  public resolve(options?: InjectionRegistration.ResolutionOptions): T {
    const context = options?.context ?? InjectionContext.create()
    const bundle = options?.bundle ?? InjectionBundle.create()

    const args = this.params?.map(param => {
      return bundle[param]
    }) ?? []

    if(this.lifecycle === 'transient') {
      return this.resolver(...args)
    }

    if(this.lifecycle === 'singleton') {
      return this.context.resolve(this.resolver, ...args)
    }

    if(this.lifecycle === 'scoped') {
      return context.resolve(this.resolver, ...args)
    }

    throw new Error(`Could not resolve registration. Invalid "${this.lifecycle}" lifecycle.`)
  }
}
