import * as Types from '@nodelith/types'

import { Token } from '../token'
import { Bundle } from '../bundle'
import { Options } from '../options'
import { Registration } from '../registration'

export class FactoryRegistration<R extends ReturnType<Types.Factory>> implements Registration<R> {
    
  public readonly token: Token;

  public constructor(target: Types.Factory<R, any>, options?: Options & {
    token?: Token
  })  {
    this.token = options?.token ?? Symbol()
  }

  public clone(bundle?: Bundle): FactoryRegistration<R> {
    throw new Error('Method not implemented')
  }
 
  public resolve(bundle?: Bundle): R {
    throw new Error('Method not implemented')
  }
}


function factory(someargs: string) {
  return {}
}
new  FactoryRegistration(factory)