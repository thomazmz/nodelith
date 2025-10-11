export type HttpResponse = (typeof HttpResponse)[(keyof typeof HttpResponse)]

export declare namespace HttpResponse {
  export type Type1xx = Extract<HttpResponse, { type: '1xx' }>

  export type Type2xx = Extract<HttpResponse, { type: '2xx' }>

  export type Type3xx = Extract<HttpResponse, { type: '3xx' }>

  export type Type4xx = Extract<HttpResponse, { type: '4xx' }>

  export type Type5xx = Extract<HttpResponse, { type: '5xx' }>
}

export const HttpResponse = Object.freeze({
  Processing: Object.freeze({
    message: 'Processing',
    slug: 'Processing',
    status: 102,
    type: '1xx',
  }),
  Ok: Object.freeze({
    message: 'Ok',
    slug: 'Ok',
    status: 200,
    type: '2xx',
  }),
  Created: Object.freeze({
    message: 'Created',
    slug: 'Created',
    status: 201,
    type: '2xx',
  }),
  Accepted: Object.freeze({
    message: 'Accepted',
    slug: 'Accepted',
    status: 202,
    type: '2xx',
  }),
  NoContent: Object.freeze({
    message: 'No Content',
    slug: 'NoContent',
    status: 204,
    type: '2xx',
  }),
  BadRequest: Object.freeze({
    message: 'Bad Request', 
    slug: 'BadRequest', 
    status: 400,
    type: '4xx',
  }),
  Unauthorized: Object.freeze({
    message: 'Unauthorized', 
    slug: 'Unauthorized', 
    status: 401,
    type: '4xx',
  }),
  Forbidden: Object.freeze({
    message: 'Forbidden', 
    slug: 'Forbidden', 
    status: 403,
    type: '4xx',
  }),
  NotFound: Object.freeze({
    message: 'Not Found', 
    slug: 'NotFound', 
    status: 404,
    type: '4xx',
  }),
  InternalServerError: Object.freeze({
    message: 'Internal Server Error', 
    slug: 'InternalServerError', 
    status: 500,
    type: '5xx',
  }),
  UnprocessableEntity: Object.freeze({
    message: 'Unprocessable Entity', 
    slug: 'UnprocessableEntity', 
    status: 422,
    type: '4xx',
  }),
  NotImplemented: Object.freeze({
    message: 'Not Implemented', 
    slug: 'NotImplemented', 
    status: 501,
    type: '5xx',
  })
})
