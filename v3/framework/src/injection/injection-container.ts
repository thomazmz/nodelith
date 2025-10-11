import { Core } from '@refresh/framework/core'
import { Utils } from '@refresh/framework/utils'
import { InjectionBundle } from './injection-bundle'
import { InjectionContext } from './injection-context'
import { InjectionRegistration } from './injection-registration'

export declare namespace InjectionContainer {
  export type FactoryOptions<T extends object> = Omit<InjectionRegistration.FactoryOptions<T>, 'context'>
  
  export type ClassOptions<T extends object> = Omit<InjectionRegistration.ClassOptions<T>, 'context'>
  
  export type FunctionOptions<T> = Omit<InjectionRegistration.FunctionOptions<T>, 'context'>
  
  export type ValueOptions<T> = Omit<InjectionRegistration.ValueOptions<T>, 'context'>
}

export class InjectionContainer {
  public static create(context?: InjectionContext): InjectionContainer {
    return new InjectionContainer(context ?? InjectionContext.create())
  }

  protected constructor(context: InjectionContext) {
    this.context = context
  }

  protected readonly registrations: Map<InjectionRegistration.Token, InjectionRegistration> = new Map()
  
  protected readonly stack: InjectionRegistration.Token[] = []

  protected readonly context: InjectionContext

  protected get bundle(): InjectionBundle {
    return InjectionBundle.create({
      entries: this.entries
    })
  }

  protected get entries(): [InjectionRegistration.Token, InjectionRegistration][] {
    return [...this.registrations.entries()].map(([token, registration]) => {
      return [token, Object.create(registration, {
        resolve: { value: (options: InjectionRegistration.ResolutionOptions) => {
          return this.resolve(token, { ...options })
        }}
      })]
    })
  }

  protected has(token: InjectionRegistration.Token | object ): boolean {
    return (typeof token === 'function' || typeof token === 'object') 
      ? this.has(Core.Identity.obtain(token))
      : this.registrations.has(token)
  }

  protected add(registration: InjectionRegistration): void {
    if(this.has(registration.token)) {
      throw new Error(
        `Could not add registration "${registration.token}". Container already includes a registration under the same token.`
      )
    }

    this.registrations.set(registration.token, registration)
  }

  public useRegistration(registration: InjectionRegistration): this {
    this.add(registration.clone({ context: this.context }))
    return this;
  }

  public useRegistrations(registrations: InjectionRegistration[]): this {
    registrations.forEach((registration) => this.useRegistration(registration))
    return this
  }

  public useFunction<T>(target: Utils.Function<T>, options?: Omit<InjectionContainer.FunctionOptions<T>, 'function'>): this {
    return this.useRegistration(InjectionRegistration.create({ ...options, function: target, context: this.context }))
  }

  public useFactory<T extends object>(target: Utils.Factory<T>, options?: Omit<InjectionContainer.FactoryOptions<T>, 'factory'>): this {
    return this.useRegistration(InjectionRegistration.create({ ...options, factory: target, context: this.context }))
  }

  public useClass<T extends object>(target: Utils.Constructor<T>, options?: Omit<InjectionContainer.ClassOptions<T>, 'class'>): this {
    return this.useRegistration(InjectionRegistration.create({ ...options, class: target, context: this.context }))
  }

  public clone(context?: InjectionContext | undefined): InjectionContainer {
    const container = InjectionContainer.create(context)
    container.useRegistrations([...this.registrations.values()])
    return container
  }

  public registerFunction<T>(token: InjectionRegistration.Token, target: Utils.Function<T>, options?: Omit<InjectionContainer.FunctionOptions<T>, 'token' | 'function'>): void {
    return this.register(token, { ...options, function: target })
  }

  public registerFactory<T extends object>(token: InjectionRegistration.Token, target: Utils.Factory<T>, options?: Omit<InjectionContainer.FactoryOptions<T>, 'token' | 'factory'>): void {
    return this.register(token, { ...options, factory: target })
  }

  public registerClass<T extends object>(token: InjectionRegistration.Token, target: Utils.Constructor<T>, options?: Omit<InjectionContainer.ClassOptions<T>, 'token' | 'class'>): void {
    return this.register(token, { ...options, class: target })
  }

  public registerValue<T>(token: InjectionRegistration.Token, target: T, options?: Omit<InjectionRegistration.ValueOptions<T>, 'token' | 'value'>): void {
    return this.register(token, { ...options, value: target })
  }

  public register<T extends object>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.FactoryOptions<T>, 'token'>): void

  public register<T extends object>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.ClassOptions<T>, 'token'>): void
 
  public register<T>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.FunctionOptions<T>, 'token'>): void

  public register<T>(token: InjectionRegistration.Token, options: Omit<InjectionContainer.ValueOptions<T>, 'token'>): void

  public register<T>(token: InjectionRegistration.Token, options: any): void {
    this.useRegistration(InjectionRegistration.create<T>({ ...options,
      context: this.context,
      token,
    }))
  }

  public resolve<T = any>(token: InjectionRegistration.Token<T>, options?: InjectionRegistration.ResolutionOptions): T

  public resolve<T = any>(token: Utils.Function<T>, options?: InjectionRegistration.ResolutionOptions): T

  public resolve<T extends object>(token: Utils.Factory<T>, options?: InjectionRegistration.ResolutionOptions): T

  public resolve<T extends object>(token: Utils.Constructor<T>, options?: InjectionRegistration.ResolutionOptions): T

  public resolve<T = any>(token: InjectionRegistration.Token<T> | object, options?: InjectionRegistration.ResolutionOptions): T {
    if(typeof token === 'function' || typeof token === 'object') {
      return this.resolve(Core.Identity.obtain(token), options)
    }

    if(!this.has(token)) {
      throw new Error(
        `Could not resolve token "${token}". Container does not have a registration under the given token.`
      )
    }

    if(!options?.context) {
      return this.resolve(token, { ...options, 
        context: InjectionContext.create()
      })
    }

    if (this.stack.includes(token)) {
      const trace = [...this.stack, token].join(' > ')
      throw new Error(
        `Could not resolve token "${token}". Cyclic dependency graph: ${trace}.`
      )
    }

    try {
      this.stack.push(token)
      return this.registrations.get(token)!.resolve({
        context: options.context,
        bundle: InjectionBundle.create({
          context: options.context,
          bundle: options.bundle,
          entries: this.entries,
        }),
      })

    } finally {
      this.stack.pop()
    }
  }
}
