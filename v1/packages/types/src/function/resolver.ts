import { Value } from '../value'
import { Function } from './function'

export type Resolver<R extends Value = Value, P extends Array<any> = []> = Function<R, P>
