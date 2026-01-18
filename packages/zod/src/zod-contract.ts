import { z, ZodISODateTime } from 'zod'

import { CoreContract } from '@nodelith/core'

type ZodContractFieldProperties<T extends CoreContract.Value> = {
  readonly shape: z.ZodType<T>
  readonly example: T
  readonly description: string,
}

class ZodContractField<T extends CoreContract.Value = CoreContract.Value> {
  public readonly shape: z.ZodType<T>

  public readonly example: T

  public readonly description: string

  public get metadata(): CoreContract.FieldMetadata<T> {
    return Object.freeze({
      example: this.example,
      description: this.description,
    })
  }

  private constructor(properties: ZodContractFieldProperties<T>) {
    this.shape = properties.shape
    this.example = properties.example
    this.description = properties.description
  }

  public clone(): ZodContractField<T> {
    return new ZodContractField({
      shape: this.shape,
      example: this.example,
      description: this.description,
    })
  }

  public optional(): ZodContractField<T | undefined> {
    return new ZodContractField({
      shape: this.shape.optional(),
      example: this.example as T | undefined,
      description: this.description,
    })
  }

  public static create<T extends CoreContract.Value>(properties: ZodContractFieldProperties<T>) {
    return new ZodContractField(properties)
  }

  public static string(metadata: CoreContract.FieldMetadata<string>): ZodContractField<string> {
    return ZodContractField.create({ ...metadata, shape: z.string() })
  }

  public static number(metadata: CoreContract.FieldMetadata<number>): ZodContractField<number> {
    return ZodContractField.create({ ...metadata, shape: z.number() })
  }

  public static boolean(metadata: CoreContract.FieldMetadata<boolean>): ZodContractField<boolean> {
    return ZodContractField.create({ ...metadata, shape: z.boolean() })
  }

  public static date(metadata: CoreContract.FieldMetadata<string>): ZodContractField<string> {
    return ZodContractField.create({ ...metadata, shape: z.iso.datetime() })
  }
}

export class ZodContract<T extends Record<string, CoreContract.Value>> implements CoreContract<T> {
  public readonly example: T

  public readonly description?: string
  
  protected constructor(
    public readonly name: string,
    private readonly fields: { [K in keyof T]: ZodContractField<T[K]> }
  ) {
    this.example = Object.fromEntries(
      Object.entries(this.fields).map(([key, field]) => [key, field.example]
    )) as T
  }

  public parse(value: unknown, error?: new (message: string) => Error): T {
    if(error) throw new error('Method not implemented.')
    else throw new Error('Method not implemented.')
  }

  public pick<K extends keyof T>(field: K): ZodContractField<T[K]> {
    return this.fields[field].clone()
  }

  public static create<T extends Record<string, CoreContract.Value>>(name: string, record: { [K in keyof T]: ZodContractField<T[K]> }) {
    return new ZodContract(name, record)
  }

  public static string<T extends string>(...args: Parameters<typeof ZodContractField<T>['string']>): ReturnType<typeof ZodContractField<T>['string']> {
    return ZodContractField.string(...args)
  }

  public static date<T extends string>(...args: Parameters<typeof ZodContractField<T>['string']>): ReturnType<typeof ZodContractField<T>['string']> {
    return ZodContractField.string(...args)
  }

  public static number<T extends number>(...args: Parameters<typeof ZodContractField<T>['number']>): ReturnType<typeof ZodContractField<T>['number']> {
    return ZodContractField.number(...args)
  }

  public static boolean<T extends boolean>(...args: Parameters<typeof ZodContractField<T>['boolean']>): ReturnType<typeof ZodContractField<T>['boolean']> {
    return ZodContractField.boolean(...args)
  }
}
