import { Bundle } from './bundle'
import { Context } from  './context'
import { Resolver, ResolverOptions } from './resolver'

type RegistrationLifecycle =
  | 'scoped' // Return an instance from the scope context if one exist
  | 'transient' // Will always return a new instance of the registration
  | 'singleton' // Will return an instance from the root context if one exist

export type RegistrationDeclarationOptions = {
  context?: Context | undefined,
  lifecycle?: RegistrationLifecycle,
}

export type RegistrationResolutionOptions = {
  bundle?: Bundle | undefined
  context?: Context | undefined,
  lifecycle?: RegistrationLifecycle,
}

export class Registration<T = any> {
  public static create<T = any>(options: RegistrationDeclarationOptions & ResolverOptions<T>): Registration<T> {
    const resolver = Resolver.create(options)
    return new Registration(resolver, options)
  }

  protected readonly resolver: Resolver<T>

  protected readonly context: Context

  public readonly lifecycle: RegistrationLifecycle

  protected constructor(resolver: Resolver<T>, options?: RegistrationDeclarationOptions) {
    this.resolver = resolver
    this.context = options?.context ?? Context.create()
    this.lifecycle = options?.lifecycle ?? 'singleton'
  }

  public clone(options?: RegistrationDeclarationOptions): Registration<T> {
    return new Registration(this.resolver, {
      lifecycle: this.lifecycle,
      context: options?.context ?? this.context,
    })
  }
  
  public resolve(options?: RegistrationResolutionOptions): T {
    const lifecycle = options?.lifecycle ?? this.lifecycle

    if(lifecycle === 'transient') {
      return this.resolver(options?.bundle ?? Bundle.create()) 
    }

    if(lifecycle === 'singleton') {
      return this.context.resolve(this.resolver, options?.bundle)
    }

    if(lifecycle === 'scoped' && options?.context) {
      return options.context.resolve(this.resolver, options?.bundle)
    }

    if(lifecycle === 'scoped' && !options?.context) {
      throw new Error('Could not resolve scoped registration. Missing resolution context')
    }

    throw new Error(`Could not resolve registration. Invalid "${lifecycle}" lifecycle.`)
  }
}
