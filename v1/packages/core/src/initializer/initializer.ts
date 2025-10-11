import * as Types from '@nodelith/types'

export interface Initializer<R extends ReturnType<Types.Factory> = ReturnType<Types.Factory>, P extends Parameters<Types.Factory> = Parameters<Types.Factory>> {
  initialize(...params:  P): Promise<R> | R
  terminate?(): Promise<void> | void
}
