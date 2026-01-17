import { InjectionContext } from './injection-context'
import { InjectionEntry } from './injection-entry'

export declare namespace InjectionBundle {
  export type DeclarationOptions = {
    readonly entries?: InjectionEntry[] | undefined
    readonly context?: InjectionContext | undefined
    readonly bundle?: InjectionBundle | undefined
  }
}

export type InjectionBundle = {
  readonly [key: string]: any
}

export function createBundle(options?: InjectionBundle.DeclarationOptions): InjectionBundle {
  if(!options?.context) {
    return createBundle({ ...options,
      context: InjectionContext.create()
    })
  }

  if(!options?.entries) {
    return createBundle({ ...options,
      entries: []
    })
  }

  return options.entries.reduce((bundle, [token, registration]) => {
    const resolver = () => registration.resolve({
      context: options.context,
      bundle,
    })

    const descriptor = {
      configurable: false,
      enumerable: true,
      get: resolver,
    }

    return Object.defineProperty(bundle, token, descriptor)
  }, Object.create(options.bundle ?? {}))
}

export const InjectionBundle = Object.freeze({
  create: createBundle
})
