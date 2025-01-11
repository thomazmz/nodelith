import { Token } from './token'
import { Bundle } from './bundle'
import { Registration } from './registration'

export class Container<B extends Bundle = any> {
  readonly bundle: Readonly<B>

  public constructor() {
    this.bundle = {} as B
  }
  
  public push(...registrations: Registration[]): void {
    throw new Error('Method not implemented')
  }

  public get(token: Token): Registration | undefined {
    throw new Error('Method not implemented')
  }
  
  public set(token: Token, builder: { build(bundle: Bundle): Registration }): Registration {
    throw new Error('Method not implemented')
  }
}
