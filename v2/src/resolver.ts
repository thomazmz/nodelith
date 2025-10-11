import { 
  TargetConstructorWrapper,
  TargetFactoryWrapper,
  TargetFunctionWrapper,
  TargetStaticWrapper,
} from './target'
import { Identity } from './identity'
import { Bundle } from './bundle'

export const DEFAULT_RESOLUTION_STRATEGY: ResolutionStrategy = 'eager' as const

export const DEFAULT_INJECTION_STRATEGY: InjectionStrategy = 'bundle' as const

export type ResolutionStrategy = 'eager' | 'lazy'

export type InjectionStrategy = 'positional' | 'bundle'

export type Resolver<T = any> = (bundle: Bundle) => T

export type ResolverConstructorOptions<T extends object = any> =
  (TargetConstructorWrapper<T> & {
    injection?: InjectionStrategy
    resolution?: ResolutionStrategy
    dependencies?: string[]
  })

export type ResolverFactoryOptions<T extends object = any> =
  (TargetFactoryWrapper<T> & { 
    injection?: InjectionStrategy
    resolution?: ResolutionStrategy 
    dependencies?: string[]
  })

export type ResolverFunctionOptions<T extends any = any> = 
  (TargetFunctionWrapper<T> & {
    injection?: InjectionStrategy
    resolution?: Extract<ResolutionStrategy, 'eager'>
    dependencies?: string[]
  })

export type ResolverStaticOptions<T extends any = any> = 
  (TargetStaticWrapper<T> & { 
    resolution?: Extract<ResolutionStrategy, 'eager'>
  })

export type ResolverObjectOptions<T extends object = any> =
  | ResolverConstructorOptions<T>
  | ResolverFactoryOptions<T>

export type ResolverValueOptions<T extends any = any> = 
  | ResolverFunctionOptions<T>
  | ResolverStaticOptions<T>

export type ResolverOptions<T extends any> = T extends object 
  ? ResolverObjectOptions<T> | ResolverValueOptions<T>
    : ResolverValueOptions<T>

function extractParameters(target: any): string[] {
  const functionArgumentListRegex = new RegExp(/(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/gm)

  const functionArgumentIdentifiersRegex = new RegExp(/([^\s,]+)/g)

  const functionString = target.toString().replace(functionArgumentListRegex, '')

  const argumentDeclarationFirstIndex = functionString.indexOf('(') + 1

  const argumentDeclarationLastIndex = functionString.indexOf(')')

  const argumentString = functionString.slice(argumentDeclarationFirstIndex, argumentDeclarationLastIndex)

  const argumentNames = argumentString.match(functionArgumentIdentifiersRegex)

  return argumentNames ?? []
}

function createProxy<T extends object = any>(resolver: Resolver<T>, prototype?: object): Resolver<T> {
  const resolution: { instance?: T } = { }

  const resolveInstance = (bundle: Bundle): T => {
    return !('instance' in resolution ) 
      ? resolution.instance = resolver(bundle)
      : resolution.instance 
  }

  return Identity.bind(resolver, (bundle: Bundle) => {
    return new Proxy<T>(Object.create(prototype ?? null), {
      get: function(_target, property) {
        const instance = resolveInstance(bundle)
        return instance[property]
      },
      set: function(_target, property, value) {
        const instance = resolveInstance(bundle)
        instance[property] = value
        return true
      },
      has: function(_target, property) {
        const instance = resolveInstance(bundle)
        return property in instance 
      },
      ownKeys: function() {
        const instance = resolveInstance(bundle)
        return Reflect.ownKeys(instance as any)
      },
      getOwnPropertyDescriptor: function(_target, property) {
        const instance = resolveInstance(bundle)
        return Object.getOwnPropertyDescriptor(instance, property)
      }
    })
  })
}

function createStaticResolver(options: ResolverStaticOptions) {
  const resolutionStrategy = options.resolution ?? DEFAULT_RESOLUTION_STRATEGY

  if(resolutionStrategy !== 'eager') {
    throw new Error(`Could not create resolver. Invalid "${resolutionStrategy}" resolution option for static target.`)
  }

  return (_bundle: Bundle) => {
    return options.static
  }
}

function createFunctionResolver(options: ResolverFunctionOptions) {
  const resolutionStrategy = options.resolution ?? DEFAULT_RESOLUTION_STRATEGY
  const injectionStrategy = options.injection ?? DEFAULT_INJECTION_STRATEGY

  const target = options.function

  const parameters = injectionStrategy === 'positional'
    ? extractParameters(target)
    : undefined

  if(resolutionStrategy !== 'eager') {
    throw new Error(`Could not create resolver. Invalid "${resolutionStrategy}" resolution option for function target.`)
  }

  const resolver = Identity.bind(target, (bundle: Bundle) => {
    const dependencies = parameters?.map(parameter => bundle[parameter]) ?? [bundle]
    return target(...dependencies)
  })

  return resolver;
}

function createFactoryResolver(options: ResolverFactoryOptions) {
  const resolutionStrategy = options.resolution ?? DEFAULT_RESOLUTION_STRATEGY
  const injectionStrategy = options.injection ?? DEFAULT_INJECTION_STRATEGY

  const target = options.factory

  const parameters = injectionStrategy === 'positional'
    ? extractParameters(target)
    : undefined

  const resolver = Identity.bind(target, (bundle: Bundle) => {
    const dependencies = parameters?.map(parameter => {
      return bundle[parameter]
    }) ?? [bundle]

    return target(...dependencies)
  })

  if(resolutionStrategy === 'lazy') {
    return createProxy(resolver)
  }

  if(resolutionStrategy === 'eager') {
    return resolver
  }

  throw new Error(`Could not create factory resolver. Invalid registration options.`)
}

function createConstructorResolver(options: ResolverConstructorOptions) {
  const resolutionStrategy = options.resolution ?? DEFAULT_RESOLUTION_STRATEGY
  const injectionStrategy = options.injection ?? DEFAULT_INJECTION_STRATEGY

  const target = options.constructor

  const parameters = injectionStrategy === 'positional'
    ? extractParameters(target)
    : undefined

  const resolver = Identity.bind(target, (bundle: Bundle) => {
    const dependencies = parameters?.map(parameter => {
      return bundle[parameter]
    }) ?? [bundle]

    return new target(...dependencies)
  })

  if(resolutionStrategy === 'lazy') {
    return createProxy(resolver, target.prototype)
  }

  if(resolutionStrategy === 'eager') {
    return resolver
  }

  throw new Error(`Could not create factory resolver. Invalid registration options.`)
}

export function createResolver<T = any>(options: ResolverOptions<T>): Resolver<T> {
  if(Object.prototype.hasOwnProperty.call(options, 'static') && 'static' in options ) {
    return createStaticResolver(options as ResolverStaticOptions)
  }

  if(Object.prototype.hasOwnProperty.call(options, 'function') && 'function' in options ) {
    return createFunctionResolver(options as ResolverFunctionOptions)
  }

  if(Object.prototype.hasOwnProperty.call(options, 'factory') && 'factory' in options) {
    return createFactoryResolver(options as ResolverFactoryOptions)
  }

  if(Object.prototype.hasOwnProperty.call(options, 'constructor') && 'constructor' in options) {
    return createConstructorResolver(options as ResolverConstructorOptions)
  }

  throw new Error(`Could not create resolver. Invalid registration options.`)
} 

export namespace Resolver {
  export const create = createResolver
}
