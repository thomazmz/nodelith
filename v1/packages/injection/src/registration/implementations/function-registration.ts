import * as Types from '@nodelith/types'

import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Lifetime } from '../../lifetime';
import { Registration } from '../registration'


export type FunctionRegistrationOptions = {
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

export class FunctionRegistration<R extends any> implements Registration<R> {
  public static create<R extends any>(target: Types.Function<R>, options: FunctionRegistrationOptions): FunctionRegistration<R> {
    throw new Error('Static method FunctionRegistration:create is mot Implemented')
  }

  public get token(): Token {
    throw new Error('FunctionRegistration class is mot Implemented')
  }

  public get access(): Access {
    throw new Error('FunctionRegistration class is mot Implemented')
  }

  public clone(bundle?: Bundle): Registration<R> {
    throw new Error('FunctionRegistration.clone method is mot Implemented')
  }
  public resolve(bundle?: Bundle): R {
    throw new Error('FunctionRegistration.resolve method is mot Implemented')
  }
}