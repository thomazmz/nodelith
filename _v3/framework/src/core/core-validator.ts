export abstract class CoreValidator<T = any> {
  abstract validate(value: unknown): Readonly<[undefined, Error] | [T, undefined]>

  public match(value: unknown): value is T {
    const [_result, error] = this.validate(value)
    return error ? false : true
  }

  public assert(value: unknown): true | never {
    const [_result, error] = this.validate(value)
    if(error) throw error
    return true
  }

  public parse(value: unknown): T {
    const [ result, error ] = this.validate(value)
    if(error) throw error
    return result
  }
}
