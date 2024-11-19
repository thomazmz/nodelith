import { Initializer } from './initializer'

export type InitializationResult<I extends Initializer> = Awaited<ReturnType<I['initialize']>>