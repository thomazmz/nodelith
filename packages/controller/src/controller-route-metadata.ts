import { FunctionType } from '@nodelith/utilities'
import { MetadataStore } from '@nodelith/metadata'
import { HttpMethod } from '@nodelith/http'
import { ControllerRequestMetadata } from 'controller-request-metadata'
import { ControllerSpecMetadata } from 'controller-spec-metadata'
import { ControllerHandlerMetadata } from 'controller-handler-metadata'

export type ControllerRouteMetadata = {
  readonly key?: string | undefined
  readonly path?: string | undefined
  readonly method?: HttpMethod | undefined
  readonly spec: ControllerSpecMetadata
  readonly request: ControllerRequestMetadata
  readonly handler: ControllerHandlerMetadata
}

const ControllerRouteKeyStorage = MetadataStore.create<ControllerRouteMetadata['key']>('__@nodelith/controller/route/key')

function resolveControllerRouteKey(target: FunctionType): ControllerRouteMetadata['key'] {
  return ControllerRouteKeyStorage.extract(target) ?? target.name
}

const ControllerRoutePathStorage = MetadataStore.create<ControllerRouteMetadata['path']>('__@nodelith/controller/route/path')

function resolveControllerRoutePath(target: FunctionType): ControllerRouteMetadata['path'] {
  return ControllerRoutePathStorage.extract(target)
}

const ControllerRouteMethodStorage = MetadataStore.create<ControllerRouteMetadata['method']>('__@nodelith/controller/route/method')

function resolveControllerRouteMethod(target: FunctionType): ControllerRouteMetadata['method'] {
  return ControllerRouteMethodStorage.extract(target)
}

export const ControllerRouteMetadata = Object.freeze({
  setKey(target: FunctionType, key: ControllerRouteMetadata['key']): void {
    ControllerRouteKeyStorage.append(target, key)
  },

  setPath(target: FunctionType, path: ControllerRouteMetadata['path']): void {
    ControllerRoutePathStorage.append(target, path)
  },

  setMethod(target: FunctionType, method: ControllerRouteMetadata['method']): void {
    ControllerRouteMethodStorage.append(target, method)
  },

  resolve(target: FunctionType): ControllerRouteMetadata {
    return Object.freeze({
      key: resolveControllerRouteKey(target),
      path: resolveControllerRoutePath(target),
      method: resolveControllerRouteMethod(target),
      spec: ControllerSpecMetadata.resolve(target),
      request: ControllerRequestMetadata.resolve(target),
      handler: ControllerHandlerMetadata.resolve(target),
    })
  }
})

export function Key(key: string) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    if(descriptor.value) ControllerRouteMetadata.setKey(descriptor.value, key)
  }
}

export function Path(path: string) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    if(descriptor.value) ControllerRouteMetadata.setPath(descriptor.value, path)
  }
}

export function Method(method: HttpMethod) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    if(descriptor.value) ControllerRouteMetadata.setMethod(descriptor.value, method)
  }
}
