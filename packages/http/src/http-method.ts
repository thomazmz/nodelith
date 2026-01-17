export type HttpMethod = typeof HttpMethod[keyof typeof HttpMethod]

export declare namespace HttpMethod {
  export type Get = typeof HttpMethod.Get
  export type Put = typeof HttpMethod.Put
  export type Post = typeof HttpMethod.Post
  export type Head = typeof HttpMethod.Head
  export type Patch = typeof HttpMethod.Patch
  export type Trace = typeof HttpMethod.Trace
  export type Delete = typeof HttpMethod.Delete
  export type Connect = typeof HttpMethod.Connect
  export type Options = typeof HttpMethod.Options
}

export const HttpMethod = Object.freeze({
  Get: 'get',
  Put: 'put',
  Post: 'post',
  Head: 'head',
  Patch: 'patch',
  Trace: 'trace',
  Delete: 'delete',
  Connect: 'connect',
  Options: 'options',
})
