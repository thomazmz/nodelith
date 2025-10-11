import { Access } from '../access'
import { Bundle } from '../bundle'
import { Token } from '../token'

export interface Registration<R = any> {
  token: Token
  access: Access
  clone: (bundle?: Bundle) => Registration<R>
  resolve: (bundle?: Bundle) => R
}