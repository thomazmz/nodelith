export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod]

export declare namespace HttpMethod {
  export type Connect = typeof HttpMethod.Connect
  export type Delete = typeof HttpMethod.Delete
  export type Get = typeof HttpMethod.Get
  export type Head = typeof HttpMethod.Head
  export type Options = typeof HttpMethod.Options
  export type Patch = typeof HttpMethod.Patch
  export type Post = typeof HttpMethod.Post
  export type Put = typeof HttpMethod.Put
  export type Trace = typeof HttpMethod.Trace
}

export const HttpMethod = Object.freeze({
  Connect: 'connect',
  Delete: 'delete',
  Get: 'get',
  Head: 'head',
  Options: 'options',
  Patch: 'patch',
  Post: 'post',
  Put: 'put',
  Trace: 'trace',
})
