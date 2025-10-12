import { FunctionUtils } from './utils-function'

export type FactoryUtils<R extends object = object, P extends Array<any> = any[]> = FunctionUtils<R, P>

export declare namespace FactoryUtils {
  export type Return<F extends FunctionUtils> = ReturnType<F>
  export type Params<F extends FunctionUtils> = Parameters<F>
}

export const FactoryUtils = Object.freeze({
  extractParameters(target: FactoryUtils): string[] {
    return FunctionUtils.extractParameters(target)
  }
})
