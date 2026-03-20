type DateType = Date

export type CoreNullable = (
  | CoreNullable.Primitive
  | CoreNullable.Struct
  | CoreNullable.Sequence
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

  export type Date = (
    | undefined
    | DateType
    | null
  )

  export type Primitive = (
    | undefined
    | boolean
    | string
    | bigint
    | number
    | Date
    | null
  )
  
  export type Sequence = undefined | null | (
    | CoreNullable.Primitive
    | CoreNullable.Struct
    | CoreNullable.Sequence
  )[]
  
  export type Struct = undefined | null | {
    readonly [key: string]: (
      | CoreNullable.Primitive
      | CoreNullable.Struct
      | CoreNullable.Sequence
    )
  }
}
