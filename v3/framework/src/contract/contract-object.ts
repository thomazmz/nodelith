import z from 'zod'
import { Utils } from '@refresh/framework/utils'
import { ContractProperty } from './contract-property'

const CONTRACT_OBJECT_METADATA_KEY = Symbol('__contract_object_metadata')

export type ContractObjectMetadata = {
  [key: string]: ContractProperty
}

function extractContractObjectMetadata(constructor: Utils.Constructor<ContractObject>): ContractObjectMetadata {
  return !constructor[CONTRACT_OBJECT_METADATA_KEY]
    ? constructor[CONTRACT_OBJECT_METADATA_KEY] = {}
    : constructor[CONTRACT_OBJECT_METADATA_KEY]
}

function attachContractObjectMetadata(constructor: Utils.Constructor<ContractObject>, metadata: ContractObjectMetadata) {
  if(!constructor[CONTRACT_OBJECT_METADATA_KEY]) {
    constructor[CONTRACT_OBJECT_METADATA_KEY] = {}
  }

  for (const [propertyKey, objectMetadata] of Object.entries(metadata)) {
    const hasNewDescription = 'description' in objectMetadata && objectMetadata['description'] !== undefined
    const hasNewExample = 'example' in objectMetadata && objectMetadata['example'] !== undefined
    const hasNewDefault = 'default' in objectMetadata && objectMetadata['default'] !== undefined
    const hasNewSchema = 'schema' in objectMetadata && objectMetadata['schema'] !== undefined

    const resolvedDescription: string = hasNewDescription 
      ? objectMetadata.description 
      : constructor[CONTRACT_OBJECT_METADATA_KEY][propertyKey]?.description

    const resolvedExample: ContractProperty.Value = hasNewExample
      ? objectMetadata.example 
      : constructor[CONTRACT_OBJECT_METADATA_KEY][propertyKey]?.example

    const resolvedDefault: ContractProperty.Value = hasNewDefault
      ? objectMetadata.default
      : constructor[CONTRACT_OBJECT_METADATA_KEY][propertyKey]?.default

    const resolvedSchema: ContractProperty.Schema = hasNewSchema
      ? objectMetadata.schema
      : constructor[CONTRACT_OBJECT_METADATA_KEY][propertyKey]?.schema

    if(resolvedSchema && resolvedDefault) {
      resolvedSchema.default(resolvedDefault)
    }

    if(resolvedSchema && resolvedDescription) {
      resolvedSchema.describe(resolvedDescription)
    }

    constructor[CONTRACT_OBJECT_METADATA_KEY][propertyKey] = {
      example: resolvedExample,
      default: resolvedDefault,
      schema: resolvedSchema,
      key: propertyKey,
    }
  }
}

export const ContractObjectMetadata = Object.freeze({
  extract: extractContractObjectMetadata,
  attach: attachContractObjectMetadata,
})

export class ContractObject {
  public static get Schema(): z.ZodObject<any> {
    return z.object(
      Object.fromEntries(
        Object.entries(ContractObjectMetadata.extract(this))
          .filter(([_key, metadata]) => metadata.schema)
          .map(([key, metadata]) => [key, metadata.schema])))
  }
}

export function Schema<
  Target extends ContractObject,
  Key extends Extract<keyof Target, string>,
>(schema: ContractProperty.Schema<ContractProperty.Value>) {
  return (target: Target, key: Key) => {
    ContractObjectMetadata.attach((target as any).constructor, {
      [key]: { key, schema }
    })
  }
}
