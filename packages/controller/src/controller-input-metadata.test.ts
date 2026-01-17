import { ControllerInputMetadata } from './controller-input-metadata'

describe('ControllerInputMetadata', () => {
  it('extracts parameter names from a function', () => {
    const descriptor: TypedPropertyDescriptor<any> = {
      value: function value(a: string, b = 1) { return [a, b] },
    }

    const inputs = ControllerInputMetadata.extract(descriptor)

    expect(inputs).toEqual({ 0: 'a', 1: 'b = 1' })
  })

  it('handles methods without explicit metadata by inferring parameters', () => {
    const descriptor: TypedPropertyDescriptor<any> = {
      value: function handler(id: string) { return id },
    }

    const inputs = ControllerInputMetadata.extract(descriptor)
    expect(inputs).toEqual({ 0: 'id' })
  })
})

