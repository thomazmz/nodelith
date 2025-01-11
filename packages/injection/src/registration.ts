import { Token } from'./token'
import { Bundle } from './bundle'

export interface Registration<R = any> {
  readonly token: Token
  resolve(bundle?: Bundle): R
  clone(bundle?: Bundle): Registration<R>
}
