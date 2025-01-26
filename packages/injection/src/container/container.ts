import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'

export class Container {

  private resolving = new Map()

  private readonly _bundle: Bundle = {}
  
  private readonly _registrations: Map<Token, Registration> = new Map()
  
  public readonly bundle: Bundle;

  public get registrations(): Registration[] {
    return Array.from(this._registrations.values())
  }

  public constructor() {
    this.bundle = new Proxy(this._bundle, {
      set: (_target: Bundle, token: Token) => {
        throw new Error(`Could not set registration "${token.toString()}". Registration should not be done through bundle.`)
      },
    })
  }

  public get(token: Token): Registration | undefined {
    return this._registrations.get(token)
  }

  public has(token: Token): boolean  {
    return this._registrations.has(token)
  }

  public push(...registrations: Registration[]): Registration[] {
    return registrations.map(registration => {
      return this.register(registration)
    })
  }

  public register(registration: Registration): Registration {
    const scopedRegistration = registration.clone(
      this.createResolutionProxy(registration.token)
    )

    if(scopedRegistration.token !== registration.token) {
      throw new Error(`Could not register "${registration.token.toString()}". Registration clone has a different token "${scopedRegistration.token.toString()}".`)
    }

    this._registrations.set(scopedRegistration.token, scopedRegistration);

    Object.defineProperty(this._bundle, scopedRegistration.token, {
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

    if (!this._registrations.has(token)) {
      return
    }

    this.resolving.set(token, token);

    const registration = this._registrations.get(token);

    if (!registration) {
      throw new Error(`Token '${token.toString()}' is not a valid registration.`);
    }

    const resolution = registration.resolve(
      this.createResolutionProxy(token)
    )

    this.resolving.delete(token);

    return resolution;
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
