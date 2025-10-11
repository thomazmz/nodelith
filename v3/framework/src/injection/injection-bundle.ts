import { InjectionContext } from './injection-context'
import { InjectionRegistration } from './injection-registration'

export declare namespace InjectionBundle {
  export type Descriptor = PropertyDescriptor | InjectionRegistration

  export type Entry = Readonly<[InjectionRegistration.Token, InjectionBundle.Descriptor]>

  export type DeclarationOptions = Readonly<{
    bundle?: InjectionBundle | undefined
    context?: InjectionContext | undefined
    entries?: InjectionBundle.Entry[] | undefined
  }>
}

export type InjectionBundle = {
  readonly [key: InjectionRegistration.Token]: any
}

export const InjectionBundle = Object.freeze({
  DEFAULT_ENUMERABLE_DECLARATION: true,
  DEFAULT_CONFIGURABLE_DECLARATION: true,

  create(options?: InjectionBundle.DeclarationOptions) {
    const context = options?.context ?? InjectionContext.create()
    return (options?.entries ?? []).reduce((bundle, [token, descriptor]) => {
      return ('resolve' in descriptor ? Object.defineProperty(bundle, token, {
        get: () => descriptor.resolve({ bundle, context }),
        enumerable: InjectionBundle.DEFAULT_ENUMERABLE_DECLARATION,
        configurable: InjectionBundle.DEFAULT_CONFIGURABLE_DECLARATION,
      }) : Object.defineProperty(bundle, token, descriptor))
    }, Object.create(options?.bundle ?? {}))
  }
})
