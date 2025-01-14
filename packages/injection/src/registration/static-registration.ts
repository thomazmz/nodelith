import { Token } from '../token'
import { Bundle } from '../bundle'
import { Registration } from '../registration'
import { StaticOptions } from '../options'

export class StaticRegistration<R = any> implements Registration<R> {
    
  public readonly token: Token;

  public constructor(resolution: R, options?: StaticOptions & {
    token?: Token
  })  {
    this.token = options?.token ?? Symbol()
  }

  public clone(bundle?: Bundle): StaticRegistration<R> {
    throw new Error('Method not implemented')
  }

  public resolve(bundle?: Bundle): R {
    throw new Error('Method not implemented')
  }
}
