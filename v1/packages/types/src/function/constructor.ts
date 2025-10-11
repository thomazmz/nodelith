export type Constructor<R extends object = object, P extends Array<any> = Array<any>> = 
  | ( new (...params: P) => R ) 
  | { new (...params: P): R }
