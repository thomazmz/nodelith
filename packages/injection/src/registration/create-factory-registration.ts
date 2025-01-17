import * as Types from '@nodelith/types'

import { Bundle } from '../bundle'
import { DynamicRegistrationOptions, Registration } from './registration'

export function createFactoryRegistration<R extends ReturnType<Types.Factory>>(
  target: Types.Factory<R>,
  options: DynamicRegistrationOptions
): Registration<R> {
  const singleton: { resolution?: R } = { }

  const clone = (bundle?: Bundle) => {
    return createFactoryRegistration(target, { ...options,
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
