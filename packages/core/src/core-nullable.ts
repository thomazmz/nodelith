export type CoreNullable = (
  | CoreNullable.Primitive
  | CoreNullable.Record
  | CoreNullable.Array
)

export declare namespace CoreNullable {
  export type String = (
    | undefined
    | string
    | null
  )

  export type Number = (
    | undefined
    | number
    | null
  )

  export type Boolean = (
    | undefined
    | boolean
    | null
  )

  export type Bigint = (
    | undefined
    | bigint
    | null
  )

  export type Primitive = (
    | undefined
    | boolean
    | string
    | bigint
    | number
    | null
  )
  
  export type Array = undefined | null | (
    | CoreNullable.Primitive
    | CoreNullable.Record
    | CoreNullable.Array
  )[]
  
  export type Record = undefined | null | {
    readonly [key: string]: (
      | CoreNullable.Primitive
      | CoreNullable.Record
      | CoreNullable.Array
    )
  }
}
