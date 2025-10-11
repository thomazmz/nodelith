import { UtilsFunction } from './utils-function'

export type UtilsFactory<R extends object = object, P extends Array<any> = any[]> = UtilsFunction<R, P>

export declare namespace UtilsFactory {
  export type Return<F extends UtilsFunction> = ReturnType<F>
  export type Params<F extends UtilsFunction> = Parameters<F>
}

export const UtilsFactory = Object.freeze({
  extractParameters(target: UtilsFactory): string[] {
    return UtilsFunction.extractParameters(target)
  }
})
