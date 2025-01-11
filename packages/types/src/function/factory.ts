import { Function } from './function'

export type Factory<R extends object = object, P extends Array<any> = []> = Function<R, P>
