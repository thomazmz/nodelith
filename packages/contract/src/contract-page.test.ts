import z from 'zod'
import { randomUUID } from 'crypto'
import { ContractPage } from './contract-page'

describe('ContractPage', () => {
  it('should attach id metadata to schema', () => {
    const refference = `${randomUUID()}Page`
    const itemSchema = z.string()
    const schema = ContractPage.create(refference as `${string}Page`, itemSchema)

    expect(schema.meta()).toEqual({ id: refference })
  })

  it('should create schema with data field from list', () => {
    const itemSchema = z.string()
    const schema = ContractPage.create(`${randomUUID()}Page` as `${string}Page`, itemSchema)

    expect(schema.shape).toBeDefined()
    expect(schema.shape.data).toBeDefined()
  })

  it('should create schema with limit field', () => {
    const itemSchema = z.string()
    const schema = ContractPage.create(`${randomUUID()}Page` as `${string}Page`, itemSchema)

    expect(schema.shape.limit).toBeDefined()
  })

  it('should create schema with offset field', () => {
    const itemSchema = z.string()
    const schema = ContractPage.create(`${randomUUID()}Page` as `${string}Page`, itemSchema)

    expect(schema.shape.offset).toBeDefined()
  })

  it('should attach description metadata to limit field', () => {
    const refference = `${randomUUID()}Page`
    const itemSchema = z.string()
    const schema = ContractPage.create(refference as `${string}Page`, itemSchema)

    const limitField = schema.shape.limit
    const limitMeta = limitField.meta()

    expect(limitMeta?.description).toContain(refference)
    expect(limitMeta?.description).toContain('Maximum number of items')
  })

  it('should attach description metadata to offset field', () => {
    const refference = `${randomUUID()}Page`
    const itemSchema = z.string()
    const schema = ContractPage.create(refference as `${string}Page`, itemSchema)

    const offsetField = schema.shape.offset
    const offsetMeta = offsetField.meta()

    expect(offsetMeta?.description).toContain(refference)
    expect(offsetMeta?.description).toContain('Number of items to offset')
  })

  it('should attach description metadata to data field', () => {
    const refference = `${randomUUID()}Page`
    const itemSchema = z.string()
    const schema = ContractPage.create(refference as `${string}Page`, itemSchema)

    const dataField = schema.shape.data
    const dataMeta = dataField.meta()

    expect(dataMeta?.description).toContain(refference)
    expect(dataMeta?.description).toContain('items in the page')
  })

  it('should work with different reference names', () => {
    const refference1 = `${randomUUID()}Page`
    const refference2 = `${randomUUID()}Page`
    
    const schema1 = ContractPage.create(refference1 as `${string}Page`, z.string())
    const schema2 = ContractPage.create(refference2 as `${string}Page`, z.string())
    
    expect(schema1.shape.limit.meta()?.description).toContain(refference1)
    expect(schema2.shape.limit.meta()?.description).toContain(refference2)
  })
})
