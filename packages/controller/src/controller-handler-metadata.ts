import { FunctionType } from "@nodelith/utilities"
import { MetadataStore } from "@nodelith/metadata"

export type ControllerHandlerMetadata = {
  readonly parameters: string[]
}

const ControllerHandlerParametersStorage = MetadataStore.create<ControllerHandlerMetadata['parameters']>('__@nodelith/controller/handler/parameters')

function resolveControllerHandlerParameters(handler: FunctionType): ControllerHandlerMetadata['parameters'] {
  return ControllerHandlerParametersStorage.extract(handler) ?? []
}

export const ControllerHandlerMetadata = {
  setParameters(handler: FunctionType, parameters: string[]): void {
    ControllerHandlerParametersStorage.append(handler, parameters)
  },
  resolve(handler: FunctionType): ControllerHandlerMetadata {
    return { parameters: resolveControllerHandlerParameters(handler) }
  },
}
