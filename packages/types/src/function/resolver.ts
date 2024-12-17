import { Value } from '../value'
import { Function } from './function'

export type Resolver<T extends Value = Value> = Function<T>
