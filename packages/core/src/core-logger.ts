export type CoreLoggerLevel = (
  | 'info'
  | 'warn'
  | 'error'
  | 'debug'
  | 'trace'
)

export interface CoreLogger {
  info(message: string, metadata?: Record<string, any>): void

  warn(message: string, metadata?: Record<string, any>): void

  error(message: string, metadata?: Record<string, any>): void

  debug(message: string, metadata?: Record<string, any>): void

  trace(message: string, metadata?: Record<string, any>): void
}
