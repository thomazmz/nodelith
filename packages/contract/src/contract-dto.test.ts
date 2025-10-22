import z from 'zod'
import { randomUUID } from 'crypto'
import { ContractDto } from './contract-dto'

describe('ContractDto', () => {
  it('should attach refference metadata to schema', () => {
    const refference = randomUUID()
    const schema = ContractDto.create(refference, {
      id: z.string(),
      name: z.string(),
    })

    expect(schema.meta()).toEqual({ refference })
  })

  it('should create an object schema with given shape', () => {
    const schema = ContractDto.create(randomUUID(), {
      id: z.string(),
      age: z.number(),
      name: z.string(),
    })

    expect(schema.shape).toBeDefined()
    expect(schema.shape.id).toBeDefined()
    expect(schema.shape.age).toBeDefined()
    expect(schema.shape.name).toBeDefined()
  })

  it('should handle empty shape', () => {
    const refference = randomUUID()
    const schema = ContractDto.create(refference, {})

    expect(schema.meta()).toEqual({ refference })
    expect(schema.shape).toEqual({})
  })

  it('should work with different reference names', () => {
    const refference1 = randomUUID()
    const refference2 = randomUUID()
    const refference3 = randomUUID()
    
    const schema1 = ContractDto.create(refference1, { id: z.string() })
    const schema2 = ContractDto.create(refference2, { id: z.string() })
    const schema3 = ContractDto.create(refference3, { id: z.string() })

    expect(schema1.meta()?.refference).toBe(refference1)
    expect(schema2.meta()?.refference).toBe(refference2)
    expect(schema3.meta()?.refference).toBe(refference3)
  })
})


