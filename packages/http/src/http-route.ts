import { HttpMethod } from './http-method'
import { CoreNullable } from "@nodelith/core"
import { CoreContract } from '@nodelith/core'
import { HttpBadRequestError, HttpInternalServerError } from './http-error'

export declare namespace HttpRoute {
  export type Options = {
    readonly id: string
    readonly key?: string
    readonly path?: string
    readonly parent?: string
    readonly method?: HttpMethod
    readonly bodyContract?: CoreContract
    readonly queryContract?: CoreContract
    readonly paramsContract?: CoreContract
    readonly headerContract?: CoreContract
    readonly responseContract?: CoreContract
  }

  export type Input = {
    readonly body?: CoreNullable
    readonly query?: CoreNullable
    readonly params?: CoreNullable
    readonly header?: CoreNullable
  }

  export type UnkownInput = {
    readonly body?: unknown
    readonly query?: unknown
    readonly params?: unknown
    readonly header?: unknown
  }

  export type Handler<
    I extends HttpRoute.Input,
    O extends CoreNullable,
  > = (input: Readonly<I>) => O
}

type UseHeader<I extends HttpRoute.Input, N extends CoreNullable> = {
  [K in keyof I | 'header']:
    K extends 'header'
      ? N
      : K extends keyof I
        ? I[K]
        : never
}

type UseParams<I extends HttpRoute.Input, N extends CoreNullable> = {
  [K in keyof I | 'params']:
    K extends 'params'
      ? N
      : K extends keyof I
        ? I[K]
        : never
}

type UseQuery<I extends HttpRoute.Input, N extends CoreNullable> = {
  [K in keyof I | 'query']:
    K extends 'query'
      ? N
      : K extends keyof I
        ? I[K]
        : never
}

type UseBody<I extends HttpRoute.Input, N extends CoreNullable> = {
  [K in keyof I | 'body']:
    K extends 'body'
      ? N
      : K extends keyof I
        ? I[K]
        : never
}
export class HttpRoute<I extends HttpRoute.Input = {}, O extends CoreNullable = undefined> {
  private constructor(private readonly options: HttpRoute.Options) {}

  public static create<O extends CoreNullable>(): HttpRoute<{}, O> {
    return new HttpRoute<{}, O>({ id: '' })
  }

  private clone<N extends HttpRoute.Input, R extends CoreNullable>(
    options: Partial<HttpRoute.Options>
  ): HttpRoute<N, R> {
    return new HttpRoute<N, R>({
      ...this.options,
      ...options,
    })
  }

  public useKey(key: string): HttpRoute<I, O> {
    return this.clone<I, O>({ key })
  }

  public useId(id: string): HttpRoute<I, O> {
    return this.clone<I, O>({ id })
  }

  public usePath(path: string): HttpRoute<I, O> {
    return this.clone<I, O>({ path })
  }

  public useMethod(method: HttpMethod): HttpRoute<I, O> {
    return this.clone<I, O>({ method })
  }

  public get bodyContract(): CoreContract<I['body']> | undefined {
    return this.options.bodyContract as CoreContract<I['body']> | undefined
  }

  public get queryContract(): CoreContract<I['query']> | undefined {
    return this.options.queryContract as CoreContract<I['query']> | undefined
  }

  public get paramsContract(): CoreContract<I['params']> | undefined {
    return this.options.paramsContract as CoreContract<I['params']> | undefined
  }

  public get headerContract(): CoreContract<I['header']> | undefined {
    return this.options.headerContract as CoreContract<I['header']> | undefined
  }

  public get outputContract(): CoreContract<O> | undefined {
    return this.options.responseContract as CoreContract<O> | undefined
  }

  public useOutputContract<C extends CoreNullable>(
    contract: CoreContract<C>
  ): HttpRoute<I, C> {
    return this.clone<I, C>({ responseContract: contract })
  }

  public useHeaderContract<C extends CoreNullable>(
    contract: CoreContract<C>
  ): HttpRoute<{ [K in keyof UseHeader<I, C>]: UseHeader<I, C>[K] }, O> {
    return this.clone({ headerContract: contract })
  }

  public useParamsContract<C extends CoreNullable>(
    contract: CoreContract<C>
  ): HttpRoute<{ [K in keyof UseParams<I, C>]: UseParams<I, C>[K] }, O> {
    return this.clone({ paramsContract: contract })
  }

  public useQueryContract<C extends CoreNullable>(
    contract: CoreContract<C>
  ): HttpRoute<{ [K in keyof UseQuery<I, C>]: UseQuery<I, C>[K] }, O> {
    return this.clone({ queryContract: contract })
  }

  public useBodyContract<C extends CoreNullable>(
    contract: CoreContract<C>
  ): HttpRoute<{ [K in keyof UseBody<I, C>]: UseBody<I, C>[K] }, O> {
    return this.clone({ bodyContract: contract })
  }

  public resolveHandler(handler: HttpRoute.Handler<I, O>): HttpRoute.Handler<I, O> {
    return (input: I) => {
      const headerResult = this.headerContract?.coerce(input?.header, { path: 'request.header' })

      if (this.headerContract && !headerResult?.success) {
        return HttpBadRequestError.throw(`Invalid request header.`)
      }

      const paramsResult = this.paramsContract?.coerce(input?.params, { path: 'request.params' })

      if (this.paramsContract && !paramsResult?.success) {
        return HttpBadRequestError.throw(`Invalid request params.`)
      }

      const queryResult = this.queryContract?.coerce(input?.query, { path: 'request.query' })

      if (this.queryContract && !queryResult?.success) {
        return HttpBadRequestError.throw(`Invalid request query.`)
      }

      const bodyResult = this.bodyContract?.coerce(input?.body, { path: 'request.body' })

      if (this.bodyContract && !bodyResult?.success) {
        return HttpBadRequestError.throw(`Invalid request body.`)
      }

      const header = () => {
        return (!this.headerContract || !headerResult?.success)
          ? HttpInternalServerError.throw(`Could not provide a "input.header" parameter to route handler. Ensure the router has an assigned header contract.`)
          : headerResult.value
      }

      const params = () => {
        return (!this.paramsContract || !paramsResult?.success)
          ? HttpInternalServerError.throw(`Could not provide a "input.params" parameter to route handler. Ensure the router has an assigned params contract.`)
          : paramsResult.value
      }

      const query = () => {
        return (!this.queryContract || !queryResult?.success)
          ? HttpInternalServerError.throw(`Could not provide a "input.query" parameter to route handler. Ensure the router has an assigned query contract.`)
          : queryResult.value
      }

      const body = () => {
        return (!this.bodyContract || !bodyResult?.success)
          ? HttpInternalServerError.throw(`Could not provide a "input.body" parameter to route handler. Ensure the router has an assigned body contract.`)
          : bodyResult.value
      }

      return handler(Object.freeze(
        Object.defineProperties({} as I, {
          ...(this.headerContract && { header: { enumerable: true, configurable: false, get: header }}),
          ...(this.paramsContract && { params: { enumerable: true, configurable: false, get: params }}),
          ...(this.queryContract && { query: { enumerable: true, configurable: false, get: query }}),
          ...(this.bodyContract && { body: { enumerable: true, configurable: false, get: body }}),
        }))
      )
    }
  }
}