export const Get = 'get'

export const Put = 'put'

export const Head = 'head'

export const Post = 'post'

export const Patch = 'patch'

export const Trace = 'trace'

export const Delete = 'delete'

export const Options = 'options'

export const Connect = 'connect'

export type Method = typeof Method[keyof typeof Method]

export const Method = Object.freeze({
  Get,
  Put,
  Head,
  Post,
  Patch,
  Trace,
  Delete,
  Options,
  Connect,
})

