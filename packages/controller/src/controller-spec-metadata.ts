import { FunctionType } from "@nodelith/utilities"
import { MetadataStore } from "../../metadata/dist/metadata-store"

export type ControllerSpecMetadata = {
  readonly operation?: string | undefined
  readonly summary?: string | undefined
}

const ControllerSpecOperationStorage = MetadataStore.create<ControllerSpecMetadata['operation']>('__@nodelith/controller/spec/operation')

function resolveControllerSpecOperation(target: FunctionType): ControllerSpecMetadata['operation'] {
  return ControllerSpecOperationStorage.extract(target) ?? target.name
}

const ControllerSpecSummaryStorage = MetadataStore.create<ControllerSpecMetadata['summary']>('__@nodelith/controller/spec/summary')

function resolveControllerSpecSummary(target: FunctionType): ControllerSpecMetadata['summary'] {
  return ControllerSpecSummaryStorage.extract(target)
}

export const ControllerSpecMetadata = Object.freeze({
  setOperation(controller: FunctionType, operation: string): void {
    ControllerSpecOperationStorage.append(controller, operation)
  },
  setSummary(controller: FunctionType, summary: string): void {
    ControllerSpecSummaryStorage.append(controller, summary)
  },
  resolve(controller: FunctionType): ControllerSpecMetadata {
    return Object.freeze({
      operation: resolveControllerSpecOperation(controller),
      summary: resolveControllerSpecSummary(controller),
    })
  }
})
