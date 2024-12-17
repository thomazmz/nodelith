import { Function } from './function'

export type Callback<Args extends any[] = any[]> = Function<void, Args>
