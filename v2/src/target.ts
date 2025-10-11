export type TargetStatic<T extends any = any> = T

export type TargetFunction<T extends any = any, P extends Array<any> = any[]> = (...params: P) => T

export type TargetFactory<T extends object = object, P extends Array<any> = any[]> = (...params: P) => T

export type TargetConstructor<T extends object = object, P extends Array<any> = Array<any>> = 
  | ( new (...params: P) => T ) 
  | { new (...params: P): T }

export type TargetValue<T extends any = any> =
  | TargetFunction<T>
  | TargetStatic<T>

export type TargetObject<T extends object = any> =
  | TargetConstructor<T>
  | TargetFactory<T>

export type TargetConstructorWrapper<T extends object> = {
  constructor: TargetConstructor<T>
}

export type TargetFactoryWrapper<T extends object> = {
  factory: TargetFactory<T> 
}

export type TargetFunctionWrapper<T extends any> = {
  function: TargetFunction<T>
}

export type TargetStaticWrapper<T extends any> = {
  static: TargetStatic<T> 
}

export type TargetObjectWrapper<T extends object> = 
  | TargetConstructorWrapper<T>
  | TargetFactoryWrapper<T>

export type TargetValueWrapper<T extends any> = 
  | TargetFunctionWrapper<T>
  | TargetStaticWrapper<T>
