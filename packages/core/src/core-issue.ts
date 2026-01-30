export class CoreIssue extends Error {
  public static create(message: string): Error {
    return new CoreIssue(message)
  }
}