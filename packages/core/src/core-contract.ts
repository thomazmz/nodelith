export declare namespace CoreContract {
  export type Infer<C> = C extends CoreContract<infer T> ? T : never

  export type Value = (
    | undefined
    | boolean
    | number
    | string
    | null
  )

  export type RootMetadata<T extends Record<string, CoreContract.Value>> = {
    readonly name: string,
    readonly example: T,
  }

  export type FieldMetadata<T extends CoreContract.Value> = {
    readonly example: T
    readonly description: string
  }
}

export interface CoreContract<T extends Record<string, CoreContract.Value> = any> extends CoreContract.RootMetadata<T> {
  parse(value: unknown, error?: new (message: string) => Error): T
  select<K extends keyof T>(key: K): CoreContract.FieldMetadata<T[K]>
}
