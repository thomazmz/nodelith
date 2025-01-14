import * as Types from '@nodelith/types'

import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'
import { ResolverOptions } from '../options'

export class ResolverRegistration<R extends ReturnType<Types.Resolver>> implements Registration<R> {
    
  public readonly token: Token;

  public constructor(resolution: Types.Resolver<R>, options?: ResolverOptions & {
    token?: Token
  })  {
    this.token = options?.token ?? Symbol()
  }

  public clone(bundle?: Bundle): ResolverRegistration<R> {
    throw new Error('Method not implemented')
  }

  public resolve(bundle?: Bundle): R {
    throw new Error('Method not implemented')
  }
}
