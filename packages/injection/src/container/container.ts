import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'

export class Container<B extends Bundle = Bundle> {
  private readonly map: Map<Token, Registration> = new Map()

  readonly bundle: Readonly<B>

  protected get tokens(): Token[] {
    return Array.from(this.map.keys())
  }

  protected get registrations(): Registration[] {
    return Array.from(this.map.values())
  }

  public constructor() {
    this.bundle = new Proxy({} as B, {
      get: (_target: B, token: Token) => {
        return this.resolve(token)
      },
      set: (_target: B, token: Token) => {
        throw new Error(`Could not set registration "${token.toString()}". Registration should not be done through bundle.`)
      },
      ownKeys: (_target: B) => {
        return this.tokens
      },
      getOwnPropertyDescriptor: (_target: B, token: Token) => {
        return !this.map.has(token) ? undefined : {
          value: this.resolve(token),
          configurable: true,
          enumerable: true,
        };
      },
    })
  }

  public has(token: Token): boolean  {
    return this.map.has(token)
  }

  public push(...registrations: Registration[]): void {
    for (const registration of registrations) {
      this.map.set(registration.token, registration)
    }
  }

  public resolve(token: Token) {
    return this.map.get(token)?.resolve(this.bundle)
  }

  public unpack(): Registration[]
  public unpack(token: string): Registration | undefined
  public unpack(token?: string): Registration[] | Registration | undefined {
    if(token) {
      return this.map.get(token)?.clone()
    }

    return Array.from(this.map.values()).map((registration) => {
      return registration.clone()
    })
  }
}
 