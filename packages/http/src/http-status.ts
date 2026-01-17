import { HttpResponse } from './http-response'

export type HttpStatus = HttpResponse['status']

export declare namespace HttpStatus {
  export type Type1xx = Extract<HttpResponse, { type: '1xx' }>['status']

  export type Type2xx = Extract<HttpResponse, { type: '2xx' }>['status']

  export type Type3xx = Extract<HttpResponse, { type: '3xx' }>['status']

  export type Type4xx = Extract<HttpResponse, { type: '4xx' }>['status']

  export type Type5xx = Extract<HttpResponse, { type: '5xx' }>['status']
}

export const HttpStatus = Object.freeze({
  Ok: HttpResponse['Ok'].status,
  Created: HttpResponse['Created'].status,
  NotFound: HttpResponse['NotFound'].status,
  Accepted: HttpResponse['Accepted'].status,
  NoContent: HttpResponse['NoContent'].status,
  Forbidden: HttpResponse['Forbidden'].status,
  BadRequest: HttpResponse['BadRequest'].status,
  Processing: HttpResponse['Processing'].status,
  Unauthorized: HttpResponse['Unauthorized'].status,
  NotImplemented: HttpResponse['NotImplemented'].status,
  InternalServerError: HttpResponse['InternalServerError'].status,
  UnprocessableEntity: HttpResponse['UnprocessableEntity'].status,
})
