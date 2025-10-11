import * as Types from '@nodelith/types'

import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Lifetime } from '../../lifetime';
import { Registration } from '../registration'

export type ConstructorRegistrationOptions = {
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

export class ConstructorRegistration<R extends object> implements Registration<R> {
  public static create<R extends object>(target: Types.Constructor<R>, options: ConstructorRegistrationOptions): ConstructorRegistration<R> {
    throw new Error('Static method ConstructorRegistration:create is mot Implemented')
  }

  public get token(): Token {
    throw new Error('ConstructorRegistration class is mot Implemented')
  }

  public get access(): Access {
    throw new Error('ConstructorRegistration class is mot Implemented')
  }

  public clone(bundle?: Bundle): Registration<R> {
    throw new Error('ConstructorRegistration.clone method is mot Implemented')
  }
  public resolve(bundle?: Bundle): R {
    throw new Error('ConstructorRegistration.resolve method is mot Implemented')
  }
}