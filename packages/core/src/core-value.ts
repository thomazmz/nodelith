export type CoreValue = (
  | CoreValue.Primitive
  | CoreValue.Struct
  | CoreValue.Sequence
)

export declare namespace CoreValue {
  export type Primitive = (
    | undefined
    | boolean
    | string
    | bigint
    | number
    | Date
  )
  
  export type Sequence = undefined | (
    | CoreValue.Primitive 
    | CoreValue.Struct
    | CoreValue.Sequence
  )[]
  
  export type Struct = undefined | {
    readonly [key: string]: (
      | CoreValue.Primitive
      | CoreValue.Struct
      | CoreValue.Sequence
    )
  }
}
