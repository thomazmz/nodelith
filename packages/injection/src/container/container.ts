import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'

export class Container<B extends Bundle = any> {
  private readonly map: Map<Token, Registration> = new Map()

  readonly bundle: Readonly<B>

  public get registrations() {
    return 
  }

  public constructor() {
    this.bundle = {} as B
  }

  public has(token: Token ): boolean  {
    return this.map.has(token)
  }
  
  public push(...registrations: Registration[]): void {
    for (const registration of registrations) {
      this.map.set(registration.token, registration)
    }
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
 