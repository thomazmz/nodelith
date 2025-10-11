import { HttpResponse } from './http-response'

export abstract class HttpError extends Error {
  public readonly httpStatus: HttpResponse['status']
  public readonly httpMessage: HttpResponse['message']

  public static throw<T extends new (message?: string, ...args: any[]) => HttpError>(this: T, ...args: ConstructorParameters<T>): never {
    throw new this(...args)
  }

  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

export abstract class HttpClientError extends HttpError {
  public readonly httpStatus: HttpResponse.Type4xx['status']
  public readonly httpMessage: HttpResponse.Type4xx['message']

  public constructor(message?: string, httpResponseData: HttpResponse.Type4xx = HttpResponse.BadRequest) {
    super(message ?? httpResponseData.message)
    this.httpMessage = httpResponseData.message
    this.httpStatus = httpResponseData.status
  }
}

export abstract class HttpServerError extends HttpError {
  public readonly httpStatus: HttpResponse.Type5xx['status']
  public readonly httpMessage: HttpResponse.Type5xx['message']

  public constructor(message?: string, httpResponseData: HttpResponse.Type5xx = HttpResponse.InternalServerError) {
    super(message ?? httpResponseData.message)
    this.httpMessage = httpResponseData.message
    this.httpStatus = httpResponseData.status
  }
}

export class HttpBadRequestError extends HttpClientError {
  public constructor(message?: string) {
    super(message, HttpResponse.BadRequest)
  }
}

export class HttpInternalServerError extends HttpServerError {
  public constructor(message?: string) {
    super(message, HttpResponse.InternalServerError)
  }
}
