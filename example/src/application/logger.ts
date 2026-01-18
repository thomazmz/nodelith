import { CoreLogger } from '@nodelith/core'

export class ApplicationLogger implements CoreLogger {
  public info(message: string, metadata?: Record<string, any>): void {
    const formatted = this.format('INFO', message, metadata)
    console.info(formatted)
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    const formatted = this.format('WARN', message, metadata)
    console.warn(formatted)
  }

  public error(message: string, metadata?: Record<string, any>): void {
    const formatted = this.format('ERROR', message, metadata)
    console.error(formatted)
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    const formatted = this.format('DEBUG', message, metadata)
    console.debug(formatted)
  }

  public trace(message: string, metadata?: Record<string, any>): void {
    const formatted = this.format('TRACE', message, metadata)
    console.trace(formatted)
  }

  private format(level: string, message: string, _metadata?: Record<string, any>) {
    return `[${level}] ${message}`
  }
}
