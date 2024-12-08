import { Function } from './function'

export type Factory<R extends object = object> = Function<R>
