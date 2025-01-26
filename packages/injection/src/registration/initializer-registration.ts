import { Bundle } from "bundle";
import * as Core from '@nodelith/core'
import * as Types from '@nodelith/types'

import { Mode } from "../mode";
import { Token } from "../token";
import { Access } from "../access";

import { Registration } from "./registration";

export type InitializerRegistrationOptions = {
  token?: Token | undefined
  bundle?: Bundle | undefined
  mode?: Mode | undefined
  access?: Access | undefined
}

export class InitializerRegistration<R extends object> implements Registration<R> {

  public static create<R extends object>(
    options: 
      | InitializerRegistrationOptions & { constructor: Types.Constructor<Core.Initializer<R>> }
      | InitializerRegistrationOptions & { factory: Types.Factory<Core.Initializer<R>> }
  ) {
    return new InitializerRegistration(Registration.create(options))
  }

  private initialization: { value?: R } = {}

  private registration: Registration<Core.Initializer<R>>

  public get token() {
    return this.registration.token
  }

  private constructor(registration:Registration<Core.Initializer<R>>) {
    this.registration = registration
  }

  public resolve(): R {
    if(!this.initialization.value) {
      throw new Error('Cannot resolve registration. Pending initialization.')
    } else {
      return this.initialization.value
    }
  }

  public clone(bundle?: Bundle): InitializerRegistration<R> {
    return new InitializerRegistration(this.registration.clone(bundle))
  }

  public async initialize(bundle?: Bundle): Promise<void> {
      this.initialization.value = await this.registration.resolve(bundle).initialize()
    }

  public terminate(): Promise<void> | void {
    return this.registration.resolve().terminate?.()
  }
}
