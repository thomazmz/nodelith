import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'

export class Container {

  private resolving = new Map()

  private readonly registrations: Map<Token, Registration> = new Map()

  private readonly dependencies: Bundle = {}

  public readonly bundle: Bundle;

  public constructor() {
    this.bundle = new Proxy(this.dependencies, {
      set: (_target: Bundle, token: Token) => {
        throw new Error(`Could not set registration "${token.toString()}". Registration should not be done through bundle.`)
      },
    })
  }

  public has(token: Token): boolean  {
    return this.registrations.has(token)
  }

  public push(...registrations: Registration[]): void {
    for (const registration of registrations) {
      this.register(registration)
    }
  }

  public register(registration: Registration) {
    const scopedRegistration = registration.clone(
      this.createResolutionProxy(registration.token)
    )

    this.registrations.set(scopedRegistration.token, scopedRegistration);

    Object.defineProperty(this.dependencies, scopedRegistration.token, {
      get: () => this.resolve(scopedRegistration.token),
      configurable: true,
      enumerable: true,
    });

    return scopedRegistration
  }

  public resolve<R>(token: Token): R | undefined {
    if (this.resolving.has(token)) {
      return
    }

    if (!this.registrations.has(token)) {
      return
    }

    this.resolving.set(token, token);

    const registration = this.registrations.get(token);

    if (!registration) {
      throw new Error(`Token '${token.toString()}' is not a valid registration.`);
    }

    const resolution = registration.resolve(
      this.createResolutionProxy(token)
    )

    this.resolving.delete(token);

    return resolution;
  }

  public unpack(): Registration[]
  public unpack(...tokens: Token[]): (Registration | undefined)[]
  public unpack(...tokens: Token[]): (Registration | undefined)[] {
    if(tokens.length > 0) {
      return tokens.map(token => {
        // const resolutionProxy = this.createResolutionProxy(token)
        return this.registrations.get(token)//?.clone(resolutionProxy)
      })
    }
    return Array.from(this.registrations.values())

    // return ).map((registration) => {
    //   // const resolutionProxy = this.createResolutionProxy(registration.token)
    //   return registration.clone(resolutionProxy)
    // })
  }

  private createResolutionProxy(resolutionToken: Token): Bundle {
    return new Proxy(this.bundle, {
      ownKeys: (target) => {
        return Reflect.ownKeys(target).filter(key => key !== resolutionToken);
      },
      getOwnPropertyDescriptor: (target, token) => {
        return token !== resolutionToken ? Reflect.getOwnPropertyDescriptor(target, token) : undefined
      },
      get: (target, token, receiver) => {
        return token !== resolutionToken ? Reflect.get(target, token, receiver) : undefined
      },
    })
  }
}
