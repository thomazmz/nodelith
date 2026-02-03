export type CoreValue = (
  | CoreValue.Primitive
  | CoreValue.Record
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
    | CoreValue.Record
    | CoreValue.Array
  )[]
  
  export type Record = undefined | {
    readonly [key: string]: (
      | CoreValue.Primitive
      | CoreValue.Record
      | CoreValue.Array
    )
  }
}
