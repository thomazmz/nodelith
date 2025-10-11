export const Ok = Object.freeze({
  message: 'Ok',
  slug: 'Ok',
  class: '2xx',
  code: 200,
})

export const Created = Object.freeze({
  message: 'Created',
  slug: 'Created',
  class: '2xx',
  code: 201,
})

export const BadRequest = Object.freeze({
  message: 'Bad Request', 
  slug: 'BadRequest', 
  class: '4xx',
  code: 400,
})

export const Unauthorized = Object.freeze({
  message: 'Unauthorized', 
  slug: 'Unauthorized', 
  class: '4xx',
  code: 401,
})

export const Forbidden = Object.freeze({
  message: 'Forbidden', 
  slug: 'Forbidden', 
  class: '4xx',
  code: 403,
})

export const NotFound = Object.freeze({
  message: 'Not Found', 
  slug: 'NotFound', 
  class: '4xx',
  code: 404,
})

export const InternalServerError = Object.freeze({
  message: 'Internal Server Error', 
  slug: 'InternalServerError', 
  class: '5xx',
  code: 500,
})

export const NotImplemented = Object.freeze({
  message: 'Not Implemented', 
  slug: 'NotImplemented', 
  class: '5xx',
  code: 501,
})

export const Status = Object.freeze({
  'Ok': Ok,
  'Created': Created,
  'BadRequest': BadRequest,
  'Unauthorized': Unauthorized,
  'Forbidden': Forbidden,
  'NotFound': NotFound,
  'InternalServerError': InternalServerError,
  'NotImplemented': NotImplemented,
})

export const Slug = Object.freeze({
  'Ok': Ok.slug,
  'Created': Created.slug,
  'BadRequest': BadRequest.slug,
  'Unauthorized': Unauthorized.slug,
  'Forbidden': Forbidden.slug,
  'NotFound': NotFound.slug,
  'InternalServerError': InternalServerError.slug,
  'NotImplemented': NotImplemented.slug,
})

export const Code = Object.freeze({
  'Ok': Ok.code,
  'Created': Created.code,
  'BadRequest': BadRequest.code,
  'Unauthorized': Unauthorized.code,
  'Forbidden': Forbidden.code,
  'NotFound': NotFound.code,
  'InternalServerError': InternalServerError.code,
  'NotImplemented': NotImplemented.code,
})

export const Message = Object.freeze({
  'Ok': Ok.message,
  'Created': Created.message,
  'BadRequest': BadRequest.message,
  'Unauthorized': Unauthorized.message,
  'Forbidden': Forbidden.message,
  'NotFound': NotFound.message,
  'InternalServerError': InternalServerError.message,
  'NotImplemented': NotImplemented.message,
})

export type Status = typeof Status[keyof typeof Status]

export type Status1xx = Extract<Status, { class: '1xx' }>

export type Status2xx = Extract<Status, { class: '2xx' }>

export type Status3xx = Extract<Status, { class: '3xx' }>

export type Status4xx = Extract<Status, { class: '4xx' }>

export type Status5xx = Extract<Status, { class: '5xx' }>

export type Message = Status['message']

export type Message1xx = Status1xx['message']

export type Message2xx = Status2xx['message']

export type Message3xx = Status3xx['message']

export type Message4xx = Status4xx['message']

export type Message5xx = Status5xx['message']

export type Code = Status['code']

export type Code1xx = Status1xx['code']

export type Code2xx = Status2xx['code']

export type Code3xx = Status3xx['code']

export type Code4xx = Status4xx['code']

export type Code5xx = Status5xx['code']


