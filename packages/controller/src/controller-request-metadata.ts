import { CoreContract } from "@nodelith/core"
import { FunctionType } from "@nodelith/utilities"
import { MetadataStore } from "@nodelith/metadata"

export type ControllerRequestMetadata = {
  readonly body?: CoreContract | undefined
  readonly query?: CoreContract | undefined
  readonly params?: CoreContract | undefined
  readonly headers?: CoreContract | undefined
}

const ControllerRequestBodyStorage = MetadataStore.create<ControllerRequestMetadata['body']>('__@nodelith/controller/request/body')

function resolveControllerRequestBody(target: FunctionType): ControllerRequestMetadata['body'] {
  return ControllerRequestBodyStorage.extract(target)
}

const ControllerRequestQueryStorage = MetadataStore.create<ControllerRequestMetadata['query']>('__@nodelith/controller/request/query')

function resolveControllerRequestQuery(target: FunctionType): ControllerRequestMetadata['query'] {
  return ControllerRequestQueryStorage.extract(target)
}

const ControllerRequestParamsStorage = MetadataStore.create<ControllerRequestMetadata['params']>('__@nodelith/controller/request/params')

function resolveControllerRequestParams(target: FunctionType): ControllerRequestMetadata['params'] {
  return ControllerRequestParamsStorage.extract(target)
}

const ControllerRequestHeadersStorage = MetadataStore.create<ControllerRequestMetadata['headers']>('__@nodelith/controller/request/headers')

function resolveControllerRequestHeaders(target: FunctionType): ControllerRequestMetadata['headers'] {
  return ControllerRequestHeadersStorage.extract(target)
}

export const ControllerRequestMetadata = {
  setBody(target: FunctionType, key: ControllerRequestMetadata['body']): void {
    ControllerRequestBodyStorage.append(target, key)
  },
  setQuery(target: FunctionType, query: ControllerRequestMetadata['query']): void {
    ControllerRequestQueryStorage.append(target, query)
  },
  setParams(target: FunctionType, params: ControllerRequestMetadata['params']): void {
    ControllerRequestParamsStorage.append(target, params)
  },
  setHeaders(target: FunctionType, headers: ControllerRequestMetadata['headers']): void {
    ControllerRequestHeadersStorage.append(target, headers)
  },
  resolve(target: FunctionType): ControllerRequestMetadata {
    return Object.freeze({
      body: resolveControllerRequestBody(target),
      query: resolveControllerRequestQuery(target),
      params: resolveControllerRequestParams(target),
      headers: resolveControllerRequestHeaders(target),
    })
  }
}

export function Body(body: CoreContract) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    if(descriptor.value) ControllerRequestMetadata.setBody(descriptor.value, body)
  }
}

export function Query(query: CoreContract) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    if(descriptor.value) ControllerRequestMetadata.setBody(descriptor.value, query)
  }
}

export function Params(params: CoreContract) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    if(descriptor.value) ControllerRequestMetadata.setBody(descriptor.value, params)
  }
}

export function Headers(headers: CoreContract) {
  return (_: unknown, _key: string, descriptor: TypedPropertyDescriptor<FunctionType>) => {
    if(descriptor.value) ControllerRequestMetadata.setBody(descriptor.value, headers)
  }
}
