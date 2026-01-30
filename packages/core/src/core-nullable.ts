export type CoreNullable = (
  | CoreNullable.Primitive
  | CoreNullable.Record
  | CoreNullable.Array
)

export declare namespace CoreNullable {
  export type Primitive = (
    | undefined
    | boolean
    | string
    | bigint
    | number
    | null
  )
  
  export type Array = (
    | CoreNullable.Primitive
    | CoreNullable.Record
  )[]
  
  export type Record = {
    readonly [key: string]: (
      | CoreNullable.Primitive
      | CoreNullable.Record
      | CoreNullable.Array
    )
  }
}
