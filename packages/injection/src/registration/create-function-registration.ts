import * as Types from '@nodelith/types'

import { Bundle } from '../bundle'
import { DynamicRegistrationOptions, Registration } from './registration'

export function createFunctionRegistration<R extends ReturnType<Types.Function>>(
  target: Types.Function<R>,
  options: DynamicRegistrationOptions
): Registration<R> {
  const singleton: { resolution?: R } = { }

  const clone = (bundle?: Bundle) => {
    return createFunctionRegistration(target, { ...options,
      bundle:{ ...bundle, ...options.bundle }
    });
  }

  const resolve = (bundle?: Bundle): R => {
    if(singleton.resolution) {
      return singleton.resolution
    }
    
    const parameters = [{ ...bundle, ...options.bundle }]

    if(options.lifetime === 'singleton') {
      return singleton.resolution = target(...parameters)
    }

    return target(...parameters)
  }

  return {
    token: options.token,
    clone,
    resolve,
  }
}
