import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'

export class Container<R extends Registration = Registration> {

  private resolving = new Map()

  private readonly registrations: Map<Token, R> = new Map()

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

  public push(...registrations: R[]): void {
    for (const registration of registrations) {
      this.register(registration)
    }
  }

  public register(registration: R) {
    this.registrations.set(registration.token, registration);

    Object.defineProperty(this.dependencies, registration.token, {
      configurable: true,
      enumerable: true,
      get: () => this.resolve(registration.token),
    });
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

  public unpack(): Registration<any, R>[] {
    return Array.from(this.registrations.values()).map((registration) => {
      const resolutionProxy = this.createResolutionProxy(registration.token)
      return registration.clone(resolutionProxy)
    })
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
