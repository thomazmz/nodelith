import * as Types from '@nodelith/types'

import { Bundle } from '../bundle'
import { DynamicRegistrationOptions, Registration } from './registration'

export function createConstructorRegistration<R extends InstanceType<Types.Constructor>>(
  target: Types.Constructor<R>,
  options: DynamicRegistrationOptions
): Registration<R> {
  const singleton: { resolution?: R } = { }

  const clone = (bundle?: Bundle) => {
    return createConstructorRegistration(target, { ...options,
      bundle:{ ...bundle, ...options.bundle }
    });
  }

  const resolve = (bundle?: Bundle): R => {
    if(singleton.resolution) {
      return singleton.resolution
    }

    const parameters = [{ ...bundle, ...options.bundle }]

    if(options.lifetime === 'singleton') {
      return singleton.resolution = new target(...parameters)
    }

    return new target(...parameters)
  }

  return {
    token: options.token,
    clone,
    resolve,
  }
}
