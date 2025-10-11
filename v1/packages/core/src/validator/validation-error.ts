export class ValidationError extends Error {
  public readonly path?: string | undefined

  constructor(message?: string, path?: string) {
    super(message)
    this.name = 'ValidationError'
    this.path = path
  }
}
