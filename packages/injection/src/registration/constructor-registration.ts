import * as Types from '@nodelith/types'

import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'
import { ConstructorOptions } from '../options'

export class ConstructorRegistration<R extends ReturnType<Types.Factory>> implements Registration<R> {
    
  public readonly token: Token;

  public constructor(resolution: Types.Constructor<R>, options?: ConstructorOptions & {
    token?: Token
  })  {
    this.token = options?.token ?? Symbol()
  }

  public clone(bundle?: Bundle): ConstructorRegistration<R> {
    throw new Error('Method not implemented')
  }

  public resolve(bundle?: Bundle): R {
    throw new Error('Method not implemented')
  }
}
