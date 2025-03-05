import { Registration } from '../registration';
import { Bundle } from '../bundle';
import { Token } from '../token';

export type ContainerOptions = {
  bundle?: Bundle | undefined
}

export class Container {

  private readonly _registrations: Map<Token, Registration> = new Map()

  private readonly resolving: Set<Token> = new Set()
  
  public readonly bundle: Bundle

  public get registrations(): Registration[] {
    return [...this._registrations.values()]
  }

  public constructor(options: ContainerOptions = {}) {
    this.bundle = options.bundle ?? {}
  }

  public has(token: Token): boolean  {
    return token in this.bundle;
  }

  public register<R>(registrations: Registration): Registration<R>

  public register(...registrations: Registration[]): Registration[]

  public register(...registrations: Registration[]): Registration | Registration[] {
    if(registrations.length > 1)  {
      return registrations.map(externalRegistration => {
        return this.register(externalRegistration)
      })
    }

    if(!registrations[0]) {
      return []
    }

    const registrationClone = registrations[0].clone(this.bundle)
    this.useRegistration(registrationClone)
    return registrationClone
  }

  public resolve<R = any>(token: Token, externalBundle?: Bundle): R | undefined {
    if (this.resolving.has(token)) {
      // Prevent infinite recursion in case of circular dependencies.
      // If the token is already being resolved, return an empty object to break
      // the cycle. This ensures that partially constructed objects can still be
      // referenced without causing a stack overflow due to recursive resolution.
      return {} as R
    }

    if (!this.has(token)) {
      return 
    }

    const registration = this._registrations.get(token)

    if (!registration) {
      // The container instance should never fulfill this condition if used
      // correctly. At this point we should have already checked whether the 
      // container contains a registration associated to the given token.
      throw new Error(`Token "${token.toString()}" is not a valid registration.`);
    }

    this.resolving.add(token)

    const resolution = registration.resolve(externalBundle)

    this.resolving.delete(token);

    return resolution;
  }

  public useRegistration(registration: Registration): void {
    this._registrations.set(registration.token, registration)
    Object.defineProperty(this.bundle, registration.token, {
      get: () => this.resolve(registration.token),
      configurable: true,
      enumerable: true,
    });
  }

  public useBundle(externalBundle: Bundle): void {
    const bundleDescriptors = Object.getOwnPropertyDescriptors(externalBundle)
    const bundleEntries = Object.entries(bundleDescriptors)
    for (const [token, descriptor] of bundleEntries) {
      Object.defineProperty(this.bundle, token, descriptor);
    }
  }
}