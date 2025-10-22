import z from 'zod'
import { randomUUID } from 'crypto'
import { ContractSlice } from './contract-slice'

describe('ContractSlice', () => {
  it('should attach id metadata to schema', () => {
    const refference = `${randomUUID()}Slice`
    const itemSchema = z.string()
    const schema = ContractSlice.create(refference as `${string}Slice`, itemSchema)

    expect(schema.meta()).toEqual({ id: refference })
  })

  it('should create schema with data field from list', () => {
    const itemSchema = z.string()
    const schema = ContractSlice.create(`${randomUUID()}Slice` as `${string}Slice`, itemSchema)

    expect(schema.shape).toBeDefined()
    expect(schema.shape.data).toBeDefined()
  })

  it('should create schema with next field', () => {
    const itemSchema = z.string()
    const schema = ContractSlice.create(`${randomUUID()}Slice` as `${string}Slice`, itemSchema)

    expect(schema.shape.next).toBeDefined()
  })

  it('should create schema with current field', () => {
    const itemSchema = z.string()
    const schema = ContractSlice.create(`${randomUUID()}Slice` as `${string}Slice`, itemSchema)

    expect(schema.shape.current).toBeDefined()
  })

  it('should create schema with previous field', () => {
    const itemSchema = z.string()
    const schema = ContractSlice.create(`${randomUUID()}Slice` as `${string}Slice`, itemSchema)

    expect(schema.shape.previous).toBeDefined()
  })

  it('should attach description metadata to next field', () => {
    const refference = `${randomUUID()}Slice`
    const itemSchema = z.string()
    const schema = ContractSlice.create(refference as `${string}Slice`, itemSchema)

    const nextField = schema.shape.next
    const nextMeta = nextField.meta()

    expect(nextMeta?.description).toContain(refference)
    expect(nextMeta?.description).toContain('Cursor pointing to the next')
  })

  it('should attach description metadata to current field', () => {
    const refference = `${randomUUID()}Slice`
    const itemSchema = z.string()
    const schema = ContractSlice.create(refference as `${string}Slice`, itemSchema)

    const currentField = schema.shape.current
    const currentMeta = currentField.meta()

    expect(currentMeta?.description).toContain(refference)
    expect(currentMeta?.description).toContain('Cursor indicating the current')
  })

  it('should attach description metadata to previous field', () => {
    const refference = `${randomUUID()}Slice`
    const itemSchema = z.string()
    const schema = ContractSlice.create(refference as `${string}Slice`, itemSchema)

    const previousField = schema.shape.previous
    const previousMeta = previousField.meta()

    expect(previousMeta?.description).toContain(refference)
    expect(previousMeta?.description).toContain('Cursor pointing to the previous')
  })

  it('should attach description metadata to data field', () => {
    const refference = `${randomUUID()}Slice`
    const itemSchema = z.string()
    const schema = ContractSlice.create(refference as `${string}Slice`, itemSchema)

    const dataField = schema.shape.data
    const dataMeta = dataField.meta()

    expect(dataMeta?.description).toContain(refference)
    expect(dataMeta?.description).toContain('items in the slice')
  })

  it('should work with different reference names', () => {
    const refference1 = `${randomUUID()}Slice`
    const refference2 = `${randomUUID()}Slice`
    
    const schema1 = ContractSlice.create(refference1 as `${string}Slice`, z.string())
    const schema2 = ContractSlice.create(refference2 as `${string}Slice`, z.string())

    expect(schema1.meta()?.id).toBe(refference1)
    expect(schema2.meta()?.id).toBe(refference2)
    
    expect(schema1.shape.next.meta()?.description).toContain(refference1)
    expect(schema2.shape.next.meta()?.description).toContain(refference2)
  })
})
