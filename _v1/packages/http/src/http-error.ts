import * as Http from './http-response'

export abstract class HttpError extends Error {
  constructor(message: string, public readonly httpStatus: Http.Status) {
    super(message)
  }
}

export abstract class ServerError extends HttpError {
  public constructor(message?: string, httpStatus: Http.Status5xx = Http.InternalServerError) {
    super(message ?? httpStatus.message, httpStatus);
  }
}

export abstract class ClientError extends HttpError {
  public constructor(message?: string, httpStatus: Http.Status4xx = Http.BadRequest) {
    super(message ?? httpStatus.message, httpStatus);
  }
}

export class NotImplementedError extends ServerError {
  public constructor(message?: string) {
    super(message, Http.NotImplemented)
  }
}

export class BadRequestError extends ClientError {
  public constructor(message?: string) {
    super(message, Http.BadRequest)
  }
}

export class NotFoundError extends ClientError {
  public constructor(message?: string) {
    super(message, Http.NotFound)
  }
}

export class UnauthorizedError extends ClientError {
  constructor(message?: string) {
    super(message, Http.Unauthorized)
  }
}

export class ForbiddenError extends ClientError {
  constructor(message?: string) {
    super(message, Http.Forbidden)
  }
}
