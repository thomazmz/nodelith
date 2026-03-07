export type CoreSchema = (
  | CoreSchema.Boolean
  | CoreSchema.Number
  | CoreSchema.String
  | CoreSchema.Object
  | CoreSchema.Array
  | CoreSchema.Null
  | CoreSchema.Enum
)

export declare namespace CoreSchema {

  export type Properties = {
    readonly [key: string]: CoreSchema
  }

  export type Base = {
    readonly title?: string
    readonly description?: string
  }

  export type Boolean = CoreSchema.Base & {
    readonly type: 'boolean' | readonly ['boolean', 'null']
  }

  export type Number = CoreSchema.Base & {
    readonly type: 'number' | readonly ['number', 'null']
  }

  export type String = CoreSchema.Base & {
    readonly type: 'string' | readonly ['string', 'null']
    readonly format?: string
  }

  export type Null = CoreSchema.Base & {
    readonly type: 'null'
  }

  export type Enum = CoreSchema.String & {
    readonly enum: (
      | readonly string[]
      | readonly [...string[], null]
    )
  }

  export type Date = CoreSchema.String & {
    readonly format: 'iso8601'
  }

  export type Bigint = CoreSchema.String & {
    readonly format: 'bigint'
  }

  export type Object = CoreSchema.Base & {
    readonly type: 'object' | readonly ['object', 'null']
    readonly required?: readonly string[]
    readonly properties: CoreSchema.Properties,
  }

  export type Array = CoreSchema.Base & {
    readonly type: 'array' | readonly ['array', 'null']
    readonly items: CoreSchema,
  }
}
