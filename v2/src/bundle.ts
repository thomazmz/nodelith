import { Token } from './token'

export type Bundle = Readonly<BundleRecord>

export type BundleRecord = Record<Token, any>

export type BundleResolver = (bundle: Bundle) => any

export type BundleDescriptor = PropertyDescriptor & { resolve?: BundleResolver } 

export type BundleDescriptorMap = Record<Token, BundleDescriptor>

export type BundleDescriptorEntry = [Token, BundleDescriptor]

export function createBundle(...descriptors: (undefined | BundleDescriptorEntry | BundleDescriptorMap)[]): Bundle {
  const entries: BundleDescriptorEntry[] = []

  for (const descriptor of descriptors) {
    if(descriptor) {
      if(!Array.isArray(descriptor)) {
        entries.push(...Object.entries(descriptor))
      } else {
        entries.push(descriptor)
      }
    }
  }

  const bundle: BundleRecord = {}

  for (const [token, { resolve, ...descriptor }] of entries) {
    if (descriptor.get !== undefined && resolve) {
      throw new Error(`Could not create Bundle. Cannot specify both 'get' and 'resolve'.`)
    }
  
    if (descriptor.value !== undefined && resolve) {
      throw new Error(`Could not create Bundle. Cannot specify both 'value' and 'resolve'.`)
    }

    if (!(token in bundle) && !resolve) {
      Object.defineProperty(bundle, token, descriptor)
    }

    if (!(token in bundle) && resolve) {
      Object.defineProperty(bundle, token, {
        get: () => resolve(bundle),
        enumerable: true,
      })
    }
  }

  return Object.freeze(bundle)
}

export function mergeBundles(...bundles: (Bundle | undefined | null)[]): Bundle {
  return createBundle(...bundles.flatMap((bundle) => {
    return Object.entries(Object.getOwnPropertyDescriptors(bundle ?? {}))
  }))
}

export namespace Bundle {
  export const create = createBundle
  export const merge = mergeBundles
}
