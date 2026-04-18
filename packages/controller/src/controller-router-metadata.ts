import { MetadataStore } from '@nodelith/metadata'
import { ConstructorType } from '@nodelith/utilities'
import { ObjectUtilities } from '@nodelith/utilities'
import { ControllerRouteMetadata } from 'controller-route-metadata'

export type ControllerRouterMetadata = {
  readonly routes: ControllerRouteMetadata[]
  readonly path: string
  readonly name: string
}

const ControllerRouterNameStorage = MetadataStore.create<ControllerRouterMetadata['name']>('__@nodelith/controller/router/name')

function resolveControllerRouterName(constructor: ConstructorType): ControllerRouterMetadata['name'] {
  return ControllerRouterNameStorage.extract(constructor) ??  constructor.name
}

const ControllerRouterPathStorage = MetadataStore.create<ControllerRouterMetadata['path']>('__@nodelith/controller/router/path')

function resolveControllerRouterPath(constructor: ConstructorType): ControllerRouterMetadata['path'] {
  return ControllerRouterPathStorage.extract(constructor) ?? '/'
}

function resolveControllerRoutes(constructor: ConstructorType): ControllerRouterMetadata['routes'] {
  return ObjectUtilities.extractFunctionMembers(constructor)
    .map(member => ControllerRouteMetadata.resolve(member.value))
    .filter(route => route.key && route.path && route.method)
}

export const ControllerRouterMetadata = Object.freeze({
  setName(constructor: ConstructorType, name: string): void {
    ControllerRouterNameStorage.append(constructor, name)
  },
  setPath(constructor: ConstructorType, path: string): void {
    ControllerRouterPathStorage.append(constructor, path)
  },
  resolve(constructor: ConstructorType): ControllerRouterMetadata {
    return Object.freeze({
      routes: resolveControllerRoutes(constructor),
      name: resolveControllerRouterName(constructor),
      path: resolveControllerRouterPath(constructor),
    })
  }
})

export function Name(name: string) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<ConstructorType>) => {
    if(descriptor.value) ControllerRouterMetadata.setName(descriptor.value, name)
  }
}

export function Router(path: string) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<ConstructorType>) => {
    if(descriptor.value) ControllerRouterMetadata.setName(descriptor.value, path)
  }
}
