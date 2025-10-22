import z from 'zod'

export type ContractValueMetadata<T> = {
  example: T
  description: string
}

export type ContractValue = (
  | ReturnType<typeof ContractValue.null>
  | ReturnType<typeof ContractValue.boolean>
  | ReturnType<typeof ContractValue.number>
  | ReturnType<typeof ContractValue.string>
  | ReturnType<typeof ContractValue.date>
  | ReturnType<typeof ContractValue.email>
  | ReturnType<typeof ContractValue.literal>
  | ReturnType<typeof ContractValue.enum>
)

export const ContractValue = Object.freeze({
  null(metadata: ContractValueMetadata<null>) {
    return z.null().meta(metadata)
  },
  boolean(metadata: ContractValueMetadata<boolean>) {
    return z.boolean().meta(metadata)
  },
  number(metadata: ContractValueMetadata<number>) {
    return z.number().meta(metadata)
  },
  string(metadata: ContractValueMetadata<string>) {
    return z.string().meta(metadata)
  },
  date(metadata: ContractValueMetadata<string>) {
    return z.iso.datetime().meta(metadata)
  },
  email(metadata: ContractValueMetadata<string>) {
    return z.email().meta(metadata)
  },
  literal<T extends string | number | null | boolean>(value: T, metadata: ContractValueMetadata<T>) {
    return z.literal(value).meta(metadata)
  },
  enum<T extends Readonly<[string, ...string[]]>>(values: T, metadata: ContractValueMetadata<T[number]>) {
    return z.enum(values).meta(metadata)
  },
})
