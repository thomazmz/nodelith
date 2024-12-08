import { ValidationError } from './validation-error';
import * as Types from '@nodelith/types'

/**
 * @description Validates a Value
 * @returns {[V, Error | undefined]} 
 * Returns a tuple being the first element an optional validation error and the second element the validated value
 */
export type ValidationFunction<V extends Types.Value = Types.Value> = (value: unknown) => [ValidationError | undefined, V ]