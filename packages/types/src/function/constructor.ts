export type Constructor<R extends object = object, Args extends Array<any> = Array<any>> = {
  new (...args: Args): R
}
