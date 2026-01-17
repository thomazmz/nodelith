import { FunctionType } from './utilities-function'
import { FunctionUtilities } from './utilities-function'

export type FactoryType<R extends object = object, P extends Array<any> = any[]> = FunctionType<R, P>

export declare namespace FactoryUtilities {
  export type Return<F extends FactoryType> = ReturnType<F>
  export type Params<F extends FactoryType> = Parameters<F>
}

export const FactoryUtilities = Object.freeze({
  extractParameters(target: FactoryType): string[] {
    return FunctionUtilities.extractParameters(target)
  }
})
