import { FunctionType } from '@nodelith/utilities'
import { HttpStatus } from '@nodelith/http'
import { HttpMethod } from '@nodelith/http'

const CONTROLLER_ROUTE_METADATA_KEY = Symbol('__controller_method_metadata')

export type ControllerRouteMetadata = Readonly<{
  readonly description?: string | undefined
  readonly operation?: string | undefined
  readonly summary?: string | undefined
  readonly success?: HttpStatus | undefined
  readonly method?: HttpMethod | undefined
  readonly path?: string | undefined
  readonly key?: string | undefined
  // readonly response?: Contract | undefined
  // readonly header?: Contract | undefined
  // readonly query?: Contract | undefined
  // readonly body?: Contract | undefined
}>

export const ControllerRouteMetadata = Object.freeze({
  attach: attachRouteMetadata,
  extract: extractRouteMetadata,
})

export function attachRouteMetadata(descriptor: TypedPropertyDescriptor<FunctionType & {
  [CONTROLLER_ROUTE_METADATA_KEY]?: ControllerRouteMetadata
}>, metadata: ControllerRouteMetadata): void {
  if (descriptor.value) descriptor.value[CONTROLLER_ROUTE_METADATA_KEY] = { ...descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY],
    description: metadata.description ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.description,
    operation: metadata.operation ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.operation,
    summary: metadata.summary ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.summary,
    success: metadata.success ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.success,
    method: metadata.method ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.method,
    path: metadata.path ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.path,
    key: metadata.key ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.key,
    // response: metadata.response ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.response,
    // header: metadata.header ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.header,
    // query: metadata.query ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.query,
    // body: metadata.body ?? descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.body,
  }
}

export function extractRouteMetadata(descriptor: TypedPropertyDescriptor<FunctionType & {
  [CONTROLLER_ROUTE_METADATA_KEY]?: ControllerRouteMetadata 
}>): ControllerRouteMetadata {
  return Object.freeze({
    description: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.description,
    operation: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.operation,
    summary: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.summary,
    success: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.success,
    method: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.method,
    path: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.path,
    key: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.key,
    // response: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.response,
    // header: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.header,
    // query: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.query,
    // body: descriptor?.value?.[CONTROLLER_ROUTE_METADATA_KEY]?.body,
  })
}

export function Summary(summary: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    attachRouteMetadata({ ...descriptor }, { key, summary })
  }
}

export function Description(description: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    return attachRouteMetadata({ ...descriptor }, { key, description })
  }
}

export function Operation(operation?: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    return attachRouteMetadata({ ...descriptor }, { key, operation })
  }
}

export function Method(method: HttpMethod) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    attachRouteMetadata({ ...descriptor }, { key, method })
  }
}

export function Path(path: string) {
  return (_: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    attachRouteMetadata({ ...descriptor }, { key, path })
  }
}

export function Success<T>(success: HttpStatus) {
  return function(_target: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) {
    attachRouteMetadata({ ...descriptor }, { key, success })
  }
}

// export function Success<T>(success: HttpStatucs, contract?: Contract<T>) {
//   return function(_target: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) {
//     attachRouteMetadata({ ...descriptor }, { key, success, ...({
//       response: contract
//     })})
//   }
// }

// export function Body<T extends z.ZodType<z.util.JSONType>>(body?: T) {
//   return function(_target: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) {
//     attachRouteMetadata({ ...descriptor }, { key, ...(body && {
//       body: ContractValidator.create(body, 'body')
//     })})
//   }
// }

// export function Query<T extends z.ZodType<z.util.JSONType>>(query?: T) {
//   return function(_target: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) {
//     attachRouteMetadata({ ...descriptor }, { key, ...(query && {
//       query: ContractValidator.create(query, 'query')
//     })})
//   }
// }

// export function Header<T extends z.ZodType<z.util.JSONType>>(header?: T) {
//   return function(_target: unknown, key: string, descriptor: TypedPropertyDescriptor<FunctionType>) {
//     attachRouteMetadata({ ...descriptor }, { key, ...(header && {
//       header: ContractValidator.create(header, 'header')
//     })})
//   }
// }
