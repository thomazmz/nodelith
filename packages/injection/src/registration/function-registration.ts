import * as Types from '@nodelith/types'

import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'
import { FunctionOptions } from '../options'

export class FunctionRegistration<R extends ReturnType<Types.Function>> implements Registration<R> {
    
  public readonly token: Token;

  public constructor(resolution: Types.Function<R>, options?: FunctionOptions & {
    token?: Token
  })  {
    this.token = options?.token ?? Symbol()
  }

  public clone(bundle?: Bundle): FunctionRegistration<R> {
    throw new Error('Method not implemented')
  }

  public resolve(bundle?: Bundle): R {
    throw new Error('Method not implemented')
  }
}
