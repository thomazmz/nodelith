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
    this.registrations.set(registration.token, registration);

    Object.defineProperty(this.dependencies, registration.token, {
      configurable: true,
      enumerable: true,
      get: () => this.resolve(registration.token),
    });
  }

  public resolve(token: Token) {
    if (this.resolving.has(token)) {
      return
    }

    if (!this.registrations.has(token)) {
      return undefined
    }

    this.resolving.set(token, token);

    const registration = this.registrations.get(token);

    if (!registration) {
      throw new Error(`Token '${token.toString()}' is not a valid registration.`);
    }

    const resolution = registration.resolve(this.bundle);

    this.resolving.delete(token);

    return resolution;
  }

    public unpack(): Registration[]
    public unpack(token: string): Registration | undefined
    public unpack(token?: string): Registration[] | Registration | undefined {
      if(token) {
        return this.registrations.get(token)?.clone()
      }

      return Array.from(this.registrations.values()).map((registration) => {
        return registration.clone()
      })
    }
}
