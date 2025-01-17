import { Token } from '../token'
import { Access } from '../access'
import { Registration } from './registration'

export function createStaticRegistration<R = any>(
  target: any,
  options: {
    token: Token,
}): Registration<R> {
  const { token } = options

  const clone = () => createStaticRegistration(target, options);

  const resolve = ()  => target

  return {
    token,
    clone,
    resolve,
  }
}
