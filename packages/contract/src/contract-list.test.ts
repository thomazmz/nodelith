import z from 'zod'
import { randomUUID } from 'crypto'
import { ContractList } from './contract-list'

describe('ContractList', () => {
  it('should attach id metadata to schema', () => {
    const refference = `${randomUUID()}_List`
    const itemSchema = z.string()
    const schema = ContractList.create(refference as `${string}List`, itemSchema)

    expect(schema.meta()).toEqual({ id: refference })
  })

  it('should create schema with data field', () => {
    const itemSchema = z.string()
    const schema = ContractList.create(`${randomUUID()}List` as `${string}List`, itemSchema)

    expect(schema.shape).toBeDefined()
    expect(schema.shape.data).toBeDefined()
  })

  it('should attach description metadata to data field', () => {
    const refference = `${randomUUID()}_List`
    const itemSchema = z.string()
    const schema = ContractList.create(refference as `${string}List`, itemSchema)

    const dataField = schema.shape.data
    const dataMeta = dataField.meta()

    expect(dataMeta?.description).toContain(refference)
    expect(dataMeta?.description).toContain('items in the list')
  })

  it('should work with different reference names', () => {
    const refference1 = `${randomUUID()}_List`
    const refference2 = `${randomUUID()}_List`
    
    const schema1 = ContractList.create(refference1 as `${string}List`, z.string())
    const schema2 = ContractList.create(refference2 as `${string}List`, z.string())

    expect(schema1.meta()?.id).toBe(refference1)
    expect(schema2.meta()?.id).toBe(refference2)
    
    expect(schema1.shape.data.meta()?.description).toContain(refference1)
    expect(schema2.shape.data.meta()?.description).toContain(refference2)
  })
})

