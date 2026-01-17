import { CoreLogger } from '@nodelith/core'

export class ApplicationLogger implements CoreLogger {
  public info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata)
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata)
  }

  public error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata)
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata)
  }

  public trace(message: string, metadata?: Record<string, any>): void {
    this.log('trace', message, metadata)
  }

  private log(level: string, message: string, metadata?: Record<string, any>) {
    const suffix = metadata ? ` ${JSON.stringify(metadata)}` : ''
    const line = `[${level.toUpperCase()}] ${message}${suffix}`

    if (level === 'error' || level === 'warn') {
      console.error(line)
      return
    }

    console.log(line)
  }
}
