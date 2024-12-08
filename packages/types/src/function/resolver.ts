import { Function } from './function'

export type ResolverResult = string | number | bigint | boolean | undefined | null | object

export type Resolver<T extends ResolverResult = ResolverResult> = Function<T>
