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
  
  export type Array = (
    | CoreValue.Primitive 
    | CoreValue.Record
  )[]
  
  export type Record = {
    readonly [key: string]: (
      | CoreValue.Primitive
      | CoreValue.Record
      | CoreValue.Array
    )
  }
}
