export type ConstructorResult = object

export type Constructor<R extends ConstructorResult = ConstructorResult, Args extends Array<any> = Array<any>> = {
  new (...args: Args): R
}
