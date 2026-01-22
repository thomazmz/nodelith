import { CoreValue } from './core-value'

export declare namespace CoreContract {
  export type Literal = CoreValue | null

  export type Infer<C> = C extends CoreContract<infer T> ? T : never

  export type Metadata<T extends CoreContract.Literal = CoreContract.Literal> = {
    readonly name?: string
    readonly example?: T
    readonly description?: string
  }
}

export interface CoreContract<T extends CoreContract.Literal = CoreContract.Literal> extends CoreContract.Metadata<T> {
  parse(value: unknown, errorConstructor?: new (message: string) => Error): T
}
