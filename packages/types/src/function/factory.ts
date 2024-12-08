import { Function } from './function'

export type FactoryResult =  object

export type Factory<R extends FactoryResult = FactoryResult> = Function<R>
