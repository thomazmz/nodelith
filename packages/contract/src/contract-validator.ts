import z from 'zod'
import { CoreValidator } from '@nodelith/core'

export class ContractValidator<T extends z.util.JSONType = any> extends CoreValidator<T> {
  public static create<T extends z.util.JSONType>(schema: z.ZodType<T>, root?: string): ContractValidator<T> {
    return new ContractValidator(schema, root)
  }

  private constructor(
    private readonly schema: z.ZodType<T>,
    private readonly root?: string,
  ) {
    super()
  }

  public validate(value: unknown): Readonly<[undefined, string] | [T, undefined]> {
    const { success, data, error } = this.schema.safeParse(value, { reportInput: true })
    if (!success) return [ undefined, this.format(error) ]
    return [data, undefined]
  }

  protected format(error: z.ZodError<T>): string {
    const refference = this.schema.meta()?.id

    const head = 'Invalid contract.'

    const issue = error.issues?.[0]

    const path = (issue?.path ?? []).reduce<string>((acc, part) => {
      if (!acc) return typeof part === 'number' ? `[${part}]` : String(part)
      return typeof part === 'number' ? `${acc}[${part}]` : `${acc}.${String(part)}`
    }, this.root ?? '')

    if(issue?.code && issue?.code === 'invalid_element' && refference && path) {
      const tail = `The operation requires a valid ${refference}. Field "${path}" contains an invalid element.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_element' && refference) {
      const tail = `The operation requires a valid ${refference}. Value contains an invalid element.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_element' && path) {
      const tail = `Field "${path}" contains an invalid element.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_element') {
      const tail = `Value contains an invalid element.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_format' && refference && path) {
      const tail = `The operation requires a valid ${refference}. Field "${path}" has invalid ${issue.format} format.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_format' && refference) {
      const tail = `The operation requires a valid ${refference}. Value has invalid ${issue.format} format.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_format' && path) {
      const tail = `Field "${path}" has invalid ${issue.format} format.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_format') {
      const tail = `Value has invalid ${issue.format} format.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type' && issue.input === undefined && refference && path) {
      const tail = `The operation requires a valid ${refference}. Field "${path}" is missing.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type' && issue.input === undefined && refference) {
      const tail = `The operation requires a valid ${refference}. Value is missing.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type' && issue.input === undefined && path) {
      const tail = `Field "${path}" is missing.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type' && issue.input === undefined) {
      const tail = `Value is missing.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type' && refference && path) {
      const tail = `The operation requires a valid ${refference}. Received "${typeof issue.input}" as "${path}" while expecting "${issue.expected}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type' && refference) {
      const tail = `The operation requires a valid ${refference}. Received "${typeof issue.input}" while expecting "${issue.expected}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type' && path) {
      const tail = `Received "${typeof issue.input}" as "${path}" while expecting "${issue.expected}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_type') {
      const tail = `Received "${typeof issue.input}" while expecting "${issue.expected}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'unrecognized_keys' && issue.keys[0] && refference && path) {
      const tail = `The operation requires a valid ${refference}. Received an invalid key "${issue.keys[0]}" in "${path}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'unrecognized_keys' && issue.keys[0] && refference) {
      const tail = `The operation requires a valid ${refference}. Received an invalid key "${issue.keys[0]}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'unrecognized_keys' && issue.keys[0] && path) {
      const tail = `Received an invalid key "${issue.keys[0]}" in "${path}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'unrecognized_keys' && issue.keys[0]) {
      const tail = `Received an invalid key "${issue.keys[0]}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_value' && issue.values?.[0] !== undefined && refference && path) {
      const tail = `The operation requires a valid ${refference}. Field "${path}" must be "${String(issue.values[0])}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_value' && issue.values?.[0] !== undefined && refference) {
      const tail = `The operation requires a valid ${refference}. Value must be "${String(issue.values[0])}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_value' && issue.values?.[0] !== undefined && path) {
      const tail = `Field "${path}" must be "${String(issue.values[0])}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'invalid_value' && issue.values?.[0] !== undefined) {
      const tail = `Value must be "${String(issue.values[0])}".`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'string' && refference && path) {
      const chars = issue.minimum === 1 ? 'character' : 'characters'
      const tail = `The operation requires a valid ${refference}. Field "${path}" must be at least ${issue.minimum} ${chars} long.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'string' && refference) {
      const chars = issue.minimum === 1 ? 'character' : 'characters'
      const tail = `The operation requires a valid ${refference}. Value must be at least ${issue.minimum} ${chars} long.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'string' && path) {
      const chars = issue.minimum === 1 ? 'character' : 'characters'
      const tail = `Field "${path}" must be at least ${issue.minimum} ${chars} long.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'string') {
      const chars = issue.minimum === 1 ? 'character' : 'characters'
      const tail = `Value must be at least ${issue.minimum} ${chars} long.`
      return `${head} ${tail}`
    }

    // too_small for numbers
    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'number' && refference && path) {
      const operator = issue.inclusive ? 'at least' : 'greater than'
      const tail = `The operation requires a valid ${refference}. Field "${path}" must be a number ${operator} ${issue.minimum}.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'number' && refference) {
      const operator = issue.inclusive ? 'at least' : 'greater than'
      const tail = `The operation requires a valid ${refference}. Value must be a number ${operator} ${issue.minimum}.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'number' && path) {
      const operator = issue.inclusive ? 'at least' : 'greater than'
      const tail = `Field "${path}" must be a number ${operator} ${issue.minimum}.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_small' && typeof issue.input === 'number') {
      const operator = issue.inclusive ? 'at least' : 'greater than'
      const tail = `Value must be a number ${operator} ${issue.minimum}.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'string' && refference && path) {
      const chars = issue.maximum === 1 ? 'character' : 'characters'
      const tail = `The operation requires a valid ${refference}. Field "${path}" must be at most ${issue.maximum} ${chars} long.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'string' && refference) {
      const chars = issue.maximum === 1 ? 'character' : 'characters'
      const tail = `The operation requires a valid ${refference}. Value must be at most ${issue.maximum} ${chars} long.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'string' && path) {
      const chars = issue.maximum === 1 ? 'character' : 'characters'
      const tail = `Field "${path}" must be at most ${issue.maximum} ${chars} long.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'string') {
      const chars = issue.maximum === 1 ? 'character' : 'characters'
      const tail = `Value must be at most ${issue.maximum} ${chars} long.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'number' && refference && path) {
      const operator = issue.inclusive ? 'at most' : 'less than'
      const tail = `The operation requires a valid ${refference}. Field "${path}" must be a number ${operator} ${issue.maximum}.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'number' && refference) {
      const operator = issue.inclusive ? 'at most' : 'less than'
      const tail = `The operation requires a valid ${refference}. Value must be a number ${operator} ${issue.maximum}.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'number' && path) {
      const operator = issue.inclusive ? 'at most' : 'less than'
      const tail = `Field "${path}" must be a number ${operator} ${issue.maximum}.`
      return `${head} ${tail}`
    }

    if(issue?.code && issue?.code === 'too_big' && typeof issue.input === 'number') {
      const operator = issue.inclusive ? 'at most' : 'less than'
      const tail = `Value must be a number ${operator} ${issue.maximum}.`
      return `${head} ${tail}`
    }

    return head
  }
}
