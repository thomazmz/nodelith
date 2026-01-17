import { HttpResponse } from './http-response'
import { HttpMessage } from './http-message'
import { HttpStatus } from './http-status'

export interface HttpError<T> {
  readonly status: HttpStatus,
  readonly message: HttpMessage,
  readonly result: any,
  readonly details: T,
}

export abstract class HttpClientError<T = string> extends Error implements HttpError<T> {

  public readonly details: T

  public readonly status: HttpStatus

  public override readonly message: HttpMessage

  protected constructor(details: T, response: HttpResponse.Type4xx) {
    super(response.message)
    this.details = details
    this.status = response.status
    this.message = response.message
  }

  get result() {
    return Object.freeze({
      status: this.status,
      message: this.message,
      details: this.details,
    })
  }
}

export abstract class HttpServerError<T = string> extends Error implements HttpError<T> {
  public readonly details: T

  public readonly status: HttpStatus

  public override readonly message: HttpMessage

  protected constructor(details: T, response: HttpResponse.Type5xx) {
    super(response.message)
    this.details = details
    this.status = response.status
    this.message = response.message
  }

  get result() {
    return Object.freeze({
      status: this.status,
      message: this.message,
    })
  }
}

export class HttpBadRequestError extends HttpClientError {
  public static throw(details: string): never {
    throw new HttpBadRequestError(details)
  }

  public constructor(details: string) {
    super(details, HttpResponse.BadRequest)
  }
}

export class HttpUnauthorizedError extends HttpClientError {
  public static throw(details: string): never {
    throw new HttpUnauthorizedError(details)
  }

  public constructor(details: string) {
    super(details, HttpResponse.Unauthorized)
  }
}

export class HttpInternalServerError extends HttpServerError {
  public static throw(details: string): never {
    throw new HttpInternalServerError(details)
  }

  public constructor(details: string) {
    super(details, HttpResponse.InternalServerError)
  }
}

export class HttpNotImplementedError extends HttpServerError {
  public static throw(details: string): never {
    throw new HttpNotImplementedError(details)
  }

  public constructor(details: string) {
    super(details, HttpResponse.NotImplemented)
  }
}
