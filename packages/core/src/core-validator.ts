import { ConstructorUtils } from '@nodelith/utils'

export abstract class CoreValidator<T> {
  public abstract validate(value: unknown): Readonly<[undefined, string] | [T, undefined]>

  public match(value: unknown): value is T {
    const [_result, error] = this.validate(value)
    return error === undefined
  }

  public assert(value: unknown, throwable: ConstructorUtils<Error, [string]> = Error): true | never {
    const [_result, error] = this.validate(value)
    if (error !== undefined) throw new throwable(error)
    return true
  }

  public parse(value: unknown, throwable: ConstructorUtils<Error, [string]> = Error): T {
    const [result, error] = this.validate(value)
    if (error !== undefined) throw new throwable(error)
    return result
  }
}
