import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'

export class Container<B extends Bundle = any> {
  private readonly map: Map<Token, Registration> = new Map()

  readonly bundle: Readonly<B>

  public get registrations() {
    return Array.from(this.map.values())
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

  public get(token: Token): Registration | undefined {
    throw new Error('Method not implemented')
  }
  
  public set(token: Token, builder: { build(bundle: Bundle): Registration }): Registration {
    throw new Error('Method not implemented')
  }
}
