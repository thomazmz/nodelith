import { BrandedToken, Token } from './token'
import { Context } from './context'
import { Registration } from './registration'
import { Bundle, BundleDescriptorEntry } from './bundle'

export type ContainerDeclarationOptions = {
  context?: Context | undefined,
}

export type ContainerResolutionOptions = {
  context?: Context | undefined,
  bundle?: Bundle | undefined,
}

export class Container<R extends Registration = Registration> {
  public static create<R extends Registration>(options?: ContainerDeclarationOptions): Container<R> {
    return new Container(options)
  }
  
  private readonly context: Context 

  private readonly registry: Map<Token, R>

  private readonly stack: Set<Token> = new Set()

  public get registrations(): ReadonlyArray<R> {
    return [...this.registry.values()]
  }

  public get entries(): Readonly<[Token, R][]> {
    return [...this.registry.entries()]
  }

  public get(token: Token): undefined | R {
    return this.registry.get(token)
  }

  public has(token: Token): boolean {
    return this.registry.has(token)
  }

  public constructor(options?: ContainerDeclarationOptions) {
    this.context = options?.context ?? Context.create()
    this.registry = new Map()
  }

  public resolve<T>(token: Token<T>, options?: ContainerResolutionOptions): T {
    if(this.stack.has(token)) {
      throw new Error(`Could not resolve registration. Unresolvable circular dependencies detected: ${[...this.stack, token].join(' > ')}`)
    }

    this.stack.add(token)

    const resolutionContext = options?.context ?? Context.create()

    const resolutionEntries = this.entries.map(([token]): BundleDescriptorEntry => {
      return [token, { resolve: (bundle: Bundle) => {
        return this.resolve(token, { bundle, 
          context: resolutionContext
        })
      }}]
    })

    const resolutionBundle = Bundle.create(
      ...resolutionEntries
    )

    const resolution = this.registry.get(token)?.resolve({ ...options,
      context: resolutionContext,
      bundle: Bundle.merge(
        resolutionBundle,
        options?.bundle,
      )
    })

    this.stack.delete(token)

    return resolution
  }

  public register<T extends any>(token: Token<T>, registration: R & Registration<T>): BrandedToken<T> {
    this.registry.set(token, registration.clone({
      context: this.context,
    }) as R & Registration<T>)

    return token as BrandedToken<T>
  }

  public clone(options?: ContainerDeclarationOptions): Container<R> {
    const container = new Container<R>({
      context: options?.context
    })

    for (const [token, registration] of this.entries) {
      container.register(token, registration)
    }

    return container;
  }
}
