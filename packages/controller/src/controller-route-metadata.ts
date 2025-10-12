import { HttpStatus } from '@nodelith/http'
import { HttpMethod } from '@nodelith/http'
import { FunctionUtils } from '@nodelith/utils'

const CONTROLLER_ROUTE_METADATA_KEY = Symbol('__controller_method_metadata')

export type ControllerRouteMetadata = Readonly<{
  readonly description?: string | undefined
  readonly operation?: string | undefined
  readonly summary?: string | undefined
  readonly success?: HttpStatus | undefined
  readonly method?: HttpMethod | undefined
  readonly path?: string | undefined
  readonly key?: string | undefined
}>

export const ControllerRouteMetadata = Object.freeze({
  attach: attachRouteMetadata,
  extract: extractRouteMetadata,
})

export function attachRouteMetadata(descriptor: TypedPropertyDescriptor<FunctionUtils>, metadata: ControllerRouteMetadata): void {
  if (descriptor.value) descriptor.value[CONTROLLER_ROUTE_METADATA_KEY] = { ...descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY],
    description: metadata.description ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.description,
    operation: metadata.operation ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.operation,
    summary: metadata.summary ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.summary,
    success: metadata.success ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.success,
    method: metadata.method ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.method,
    path: metadata.path ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.path,
    key: metadata.key ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.key,
  }
}

export function extractRouteMetadata(descriptor: TypedPropertyDescriptor<FunctionUtils>): ControllerRouteMetadata {
  return Object.freeze({
    description: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.description,
    operation: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.operation,
    summary: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.summary,
    success: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.success,
    method: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.method,
    path: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.path,
    key: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.key,
  })
}

export function Summary(summary: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionUtils>) => {
    attachRouteMetadata({ ...descriptor }, { key, summary });
  };
}

export function Description(description: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionUtils>) => {
    return attachRouteMetadata({ ...descriptor }, { key, description });
  };
}

export function Operation(operation?: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionUtils>) => {
    return attachRouteMetadata({ ...descriptor }, { key, operation });
  };
}

export function Success(success: HttpStatus) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionUtils>) => {
    return attachRouteMetadata({ ...descriptor }, { key, success });
  };
}

export function Method(method: HttpMethod) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionUtils>) => {
    attachRouteMetadata({ ...descriptor }, { key, method });
  };
}

export function Path(path?: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionUtils>) => {
    attachRouteMetadata({ ...descriptor }, { key, path });
  };
}
