import { Function } from './function'

export type Factory<R extends object = object, P extends Array<any> = any[]> = Function<R, P>
