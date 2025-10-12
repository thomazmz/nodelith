import { ConstructorUtils } from '@nodelith/utils'

const CONTROLLER_ROUTER_METADATA_KEY = Symbol('__controller_router_metadata')

export type ControllerRouterMetadata = Readonly<{
  readonly name?: string | undefined
  readonly path?: string | undefined
}> 

export const ControllerRouterMetadata = Object.freeze({
  attach: attachRouterMetadata,
  extract: extractRouterMetadata,
})

export function attachRouterMetadata(constructor: ConstructorUtils, metadata: ControllerRouterMetadata): void {
  constructor[CONTROLLER_ROUTER_METADATA_KEY] = {
    name: metadata.name ?? constructor[CONTROLLER_ROUTER_METADATA_KEY]?.name,
    path: metadata.path ?? constructor[CONTROLLER_ROUTER_METADATA_KEY]?.path,
  }
}

export function extractRouterMetadata(constructor: ConstructorUtils): ControllerRouterMetadata {
  return Object.freeze({
    name: constructor[CONTROLLER_ROUTER_METADATA_KEY]?.name,
    path: constructor[CONTROLLER_ROUTER_METADATA_KEY]?.path,
  })
}

export function Router<Result extends InstanceType<ConstructorUtils>, Args extends any[]>(path: string) {
  return (constructor: ConstructorUtils<Result, Args>) => {
    attachRouterMetadata(constructor, { path })
    return constructor
  }
}

export function Name<Result extends InstanceType<ConstructorUtils>, Args extends any[]>(name: string) {
  return (constructor: ConstructorUtils<Result, Args>) => {
    attachRouterMetadata(constructor, { name })
    return constructor
  }
}
