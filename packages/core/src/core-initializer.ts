export interface CoreInitializer<R = any, P extends Array<any> = any> {
  initialize(...params: P): Promise<R> | R
  terminate?(): Promise<void> | void
}
