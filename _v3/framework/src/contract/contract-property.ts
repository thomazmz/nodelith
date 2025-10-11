import z from 'zod'

export type ContractProperty<T extends ContractProperty.Value = ContractProperty.Value> = {
  readonly key: string
  readonly schema?: ContractProperty.Schema<T>
  readonly default?: T
  readonly example?: T
}

export namespace ContractProperty {
  export type Schema<T extends Value = Value> = z.ZodType<T>
  export type Value = undefined | null | boolean | number | string | Array<Value>
}
