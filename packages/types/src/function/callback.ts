import { Function } from './function'

export type Callback<R = any, Err extends Error = Error> = Function<void, [Err, undefined | null] | [undefined | null, R]>

