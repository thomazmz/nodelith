import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'

export class Container<B extends Bundle = Bundle> {
  private readonly map: Map<Token, Registration> = new Map()

  readonly bundle: Readonly<B>

  public get registrations() {
    return 
  }

  public constructor() {
    this.bundle = new Proxy({} as B, {
      get: (target: B, token: Token) => {
        return this.map.get(token)?.resolve(this.bundle)
      },
      set: (target: B, token: Token) => {
        throw new Error(`Could not set registration "${token.toString()}". Registration should not be done through bundle.`)
      },
    })
  }

  public has(token: Token ): boolean  {
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
 