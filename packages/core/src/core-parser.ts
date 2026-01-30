import { CoreIssue } from './core-issue'

export declare namespace CoreParser {
  export type Success<T> = {
    readonly success: true
    readonly value: T
  }

  export type Failure = {
    readonly success: false
    readonly issues: CoreIssue[]
  }

  export type Result<T> = (
    | Success<T>
    | Failure
  )
}

export interface CoreParser<T = any> {
  parse(input: unknown): CoreParser.Result<T>
}
