import { Token } from './token'
import { Bundle } from './bundle'
import { Registration } from './registration'

export interface Container<B extends Bundle = any> {
  readonly bundle: Readonly<B>
  
  push(...registrations: Registration[]): void

  get(token: Token): Registration | undefined
  
  set(token: Token, builder: { build(bundle: Bundle): Registration }): Registration
}
