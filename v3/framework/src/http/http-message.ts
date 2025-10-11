import { HttpResponse } from './http-response'

export type HttpMessage = HttpResponse['message']

export declare namespace HttpMessage {
  export type Type1xx = Extract<HttpResponse, { type: '1xx' }>['message']

  export type Type2xx = Extract<HttpResponse, { type: '2xx' }>['message']

  export type Type3xx = Extract<HttpResponse, { type: '3xx' }>['message']

  export type Type4xx = Extract<HttpResponse, { type: '4xx' }>['message']

  export type Type5xx = Extract<HttpResponse, { type: '5xx' }>['message']
}

export const HttpMessage = Object.freeze({
  Processing: HttpResponse['Processing'].message,
  Ok: HttpResponse['Ok'].message,
  Created: HttpResponse['Created'].message,
  Accepted: HttpResponse['Accepted'].message,
  NoContent: HttpResponse['NoContent'].message,
  BadRequest: HttpResponse['BadRequest'].message,
  Unauthorized: HttpResponse['Unauthorized'].message,
  Forbidden: HttpResponse['Forbidden'].message,
  NotFound: HttpResponse['NotFound'].message,
  InternalServerError: HttpResponse['InternalServerError'].message,
  UnprocessableEntity: HttpResponse['UnprocessableEntity'].message,
  NotImplemented: HttpResponse['NotImplemented'].message,
})
