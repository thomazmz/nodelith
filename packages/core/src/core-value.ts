export type CoreValue = (
  | CoreValue.Primitive
  | CoreValue.Struct
  | CoreValue.Array
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
  
  export type Array = undefined | (
    | CoreValue.Primitive 
    | CoreValue.Struct
    | CoreValue.Array
  )[]
  
  export type Struct = undefined | {
    readonly [key: string]: (
      | CoreValue.Primitive
      | CoreValue.Struct
      | CoreValue.Array
    )
  }
}
