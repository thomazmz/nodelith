import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Registration } from '../registration'

export type StaticRegistrationOptions = {
  token?: Token | undefined;
  access?: Access | undefined;
}

export class StaticRegistration<R> implements Registration<R> {
  public static create<R>(target: any, options: StaticRegistrationOptions): StaticRegistration<R> {
    throw new Error('Static method StaticRegistration:create is mot Implemented')
  }

  public get token(): Token {
    throw new Error('StaticRegistration class is mot Implemented')
  }

  public get access(): Access {
    throw new Error('StaticRegistration class is mot Implemented')
  }

  public clone(bundle?: Bundle): Registration<R> {
    throw new Error('StaticRegistration.clone method is mot Implemented')
  }
  public resolve(bundle?: Bundle): R {
    throw new Error('StaticRegistration.resolve method is mot Implemented')
  }
}