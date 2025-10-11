import { Utils } from '@refresh/framework/utils'

const CONTROLLER_INPUT_METADATA_KEY = Symbol('__controller_input_metadata')

export type ControllerInputMetadata = Readonly<{
  readonly [key: number]: string
}>

export const ControllerInputMetadata = Object.freeze({
  extract: extractInputMetadata,
})

export function extractInputMetadata(descriptor: TypedPropertyDescriptor<Utils.Function>): ControllerInputMetadata {
  if (descriptor.value && descriptor.value[CONTROLLER_INPUT_METADATA_KEY]) {
    return descriptor.value[CONTROLLER_INPUT_METADATA_KEY]
  }

  if(typeof descriptor.value === 'function') {
    const parameters = Utils.Function.extractParameters(descriptor.value)

    return Object.freeze({
      ...Object.fromEntries(parameters.entries()),
    });
  }

  return descriptor?.value?.[CONTROLLER_INPUT_METADATA_KEY] ?? []
}
