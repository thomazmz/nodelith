import { ConstructorType } from '@nodelith/utilities'

const CONTROLLER_ROUTER_METADATA_KEY = Symbol('__controller_router_metadata')

export type ControllerRouterMetadata = Readonly<{
  readonly name?: string | undefined
  readonly path?: string | undefined
}> 

export const ControllerRouterMetadata = Object.freeze({
  attach: attachRouterMetadata,
  extract: extractRouterMetadata,
})

export function attachRouterMetadata(constructor: ConstructorType & {
  [CONTROLLER_ROUTER_METADATA_KEY]?: ControllerRouterMetadata 
}, metadata: ControllerRouterMetadata): void {
  constructor[CONTROLLER_ROUTER_METADATA_KEY] = {
    name: metadata.name ?? constructor[CONTROLLER_ROUTER_METADATA_KEY]?.name,
    path: metadata.path ?? constructor[CONTROLLER_ROUTER_METADATA_KEY]?.path,
  }
}

export function extractRouterMetadata(constructor: ConstructorType & {
  [CONTROLLER_ROUTER_METADATA_KEY]?: ControllerRouterMetadata 
}): ControllerRouterMetadata {
  return Object.freeze({
    name: constructor[CONTROLLER_ROUTER_METADATA_KEY]?.name,
    path: constructor[CONTROLLER_ROUTER_METADATA_KEY]?.path,
  })
}

export function Router(path: string) {
  return <C extends ConstructorType>(constructor: C): C => {
    attachRouterMetadata(constructor, { path })
    return constructor
  }
}

export function Name(name: string) {
  return <C extends ConstructorType>(constructor: C): C => {
    attachRouterMetadata(constructor, { name })
    return constructor
  }
}
