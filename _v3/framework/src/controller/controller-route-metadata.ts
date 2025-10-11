import { Contract } from '@refresh/framework/contract'
import { Utils } from '@refresh/framework/utils'
import { Http } from '@refresh/framework/http'

const CONTROLLER_ROUTE_METADATA_KEY = Symbol('__controller_method_metadata')

export type ControllerRouteMetadata = Readonly<{
  readonly body?: typeof Contract.Input
  readonly query?: typeof Contract.Input
  readonly headers?: typeof Contract.Input
  readonly description?: string | undefined
  readonly operation?: string | undefined
  readonly summary?: string | undefined
  readonly success?: Http.Status | undefined
  readonly method?: Http.Method | undefined
  readonly path?: string | undefined
  readonly key?: string | undefined
}>

export const ControllerRouteMetadata = Object.freeze({
  attach: attachRouteMetadata,
  extract: extractRouteMetadata,
})

export function attachRouteMetadata(descriptor: TypedPropertyDescriptor<Utils.Function>, metadata: ControllerRouteMetadata): void {
  if (descriptor.value) descriptor.value[CONTROLLER_ROUTE_METADATA_KEY] = { ...descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY],
    description: metadata.description ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.description,
    operation: metadata.operation ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.operation,
    summary: metadata.summary ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.summary,
    success: metadata.success ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.success,
    headers: metadata.headers ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.headers,
    method: metadata.method ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.method,
    query: metadata.query ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.query,
    body: metadata.body ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.body,
    path: metadata.path ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.path,
    key: metadata.key ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.key,
  }
}

export function extractRouteMetadata(descriptor: TypedPropertyDescriptor<Utils.Function>): ControllerRouteMetadata {
  return Object.freeze({
    description: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.description,
    operation: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.operation,
    summary: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.summary,
    success: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.success,
    headers: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.headers,
    method: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.method,
    query: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.query,
    body: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.body,
    path: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.path,
    key: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.key,
  })
}

export function Summary(summary: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    attachRouteMetadata({ ...descriptor }, { key, summary });
  };
}

export function Description(description: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    return attachRouteMetadata({ ...descriptor }, { key, description });
  };
}

export function Operation(operation?: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    return attachRouteMetadata({ ...descriptor }, { key, operation });
  };
}

export function Success(success: Http.Status) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    return attachRouteMetadata({ ...descriptor }, { key, success });
  };
}

export function Method(method: Http.Method) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    attachRouteMetadata({ ...descriptor }, { key, method });
  };
}

export function Path(path?: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    attachRouteMetadata({ ...descriptor }, { key, path });
  };
}

export function Body(contract: typeof Contract.Input) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    attachRouteMetadata({ ...descriptor }, { key, body: contract });
  };
}

export function Headers(contract: typeof Contract.Input) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    attachRouteMetadata({ ...descriptor }, { key, headers: contract });
  };
}

export function Query(contract: typeof Contract.Input) {
return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<Utils.Function>) => {
    attachRouteMetadata({ ...descriptor }, { key, query: contract });
  };
}
