import express from 'express'
import { Http } from '@refresh/framework/http'
import { Utils } from '@refresh/framework/utils'
import { Controller } from '@refresh/framework/controller'
import { InjectionModule } from '@refresh/framework/injection'
import { InjectionContext } from '@refresh/framework/injection'

export class ExpressModule extends InjectionModule {
  public static create(context?: InjectionContext): ExpressModule {
    return new ExpressModule(context ?? InjectionContext.create())
  }

  private readonly controllers: Utils.Constructor[] = []

  public useController(controller: Utils.Constructor): this {
    this.controllers.push(controller)
    return this.useClass(controller, {
      // Controllers are scoped because we want to spawn
      // one instance of them for each incomming http request.
      lifecycle: 'scoped'
    })
  }

  public resolveApplication(): express.Express {
    const router = this.resolveRouter()
    return express().use(router)
  }

  public resolveRouter(): express.Router {
    return this.controllers.reduce((applicationRouter, constructor) => {
      // Calling the extract method here will already take care of
      // routes that are not fully annotated, which otherwise could
      // result in missing medatata. This should happen before the
      // application handler is declared so that we keep the the
      // returned aggregate static across different http calls.
      const { path, routes } = Controller.RootMetadata.extract(constructor)

      return applicationRouter.use(path, routes.reduce((controllerRouter, metadata) => {
        // Typescript will suggest converting this to an async
        // function. Since Express can't handle async operations
        // nativelly, we should stick with regular Promise chains
        // so that asyncronicity is handled as explicitly as possible.
        const handler: express.RequestHandler = (request, response, next) => {
          // The strings here are the allowed values to be passed
          // during the controller method call. When no match is
          // found, it attempts to find a request parameter value
          // that matches the method parameter identifier. This
          // allow injection of headers, queries, bodies and any
          // parameters included on the method path declaration.
          const argumentz = Object.values(metadata.inputs).map(parameter => {
            if(parameter === 'body') {
              // We parse the data comming through the request body. If a body metadata is not attachd,
              // a server error is thrown since it means the controller wants to access the request body
              // but we haven't assigned a schema to the controller metadata.
              return metadata.body ? metadata.body.parse(request.body, Http.BadRequestError) : Http.InternalServerError.throw(
                `Could not provide a "body" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Body annotation is assigned to the route method.`
              )
            }

            if(parameter === 'query') {
              // We parse the data comming through the request query. If a query metadata is not attachd,
              // a server error is thrown since it means the controller wants to access the request query
              // but we haven't assigned a schema to the controller metadata.
              return metadata.query ? metadata.query.parse(request.query, Http.BadRequestError) : Http.InternalServerError.throw(
                `Could not provide a "query" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Query annotation is assigned to the route method.`
              )
            }

            if(parameter === 'headers') {
              // We parse the data comming through the request headers. If a headers metadata is not attachd,
              // a server error is thrown since it means the controller wants to access the request headers
              // but we haven't assigned a schema to the controller metadata.
              return metadata.headers ? metadata.headers.parse(request.headers, Http.BadRequestError) : Http.InternalServerError.throw(
                `Could not provide a "headers" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Headers annotation is assigned to the route method.`
              )
            }

            if(parameter === 'response') {
              return response
            }

            if(parameter === 'request') {
              return request
            }

            return request.params[parameter]
          })

          // This will resolve the controller instance to be
          // called, allowing dependency injection to happen
          // on the scope of each http request. 
          const controller = this.resolve(constructor)

          // Finally, this calls the controller method (identified by
          // the metadata.key) and handles the returned value either
          // as a promise or as a synchronous operation.
          const promise = (() => {
            try {
              return Promise.resolve(controller[metadata.key](...argumentz))
            } catch(error: unknown) {
              return Promise.resolve(error)
            }
          })()

          return promise.then((result: unknown) => {
            return metadata.success !== Http.Status.NoContent
              ? response.status(metadata.success).json(result)
              : response.status(metadata.success).send()
          }).catch((error: Error) => {
            // Any errors that might be catched are passed down the
            // request handler chain, through which it should eventually
            // reach a global error handler.
            return next(error)
          })
        }

        // Append the route handler to the controller router.
        // This mimics router.get('/path', ...handlers, (req, res, next) => { ... })
        return controllerRouter[metadata.method](metadata.path, express.json(), handler)
      }, express.Router()))
    }, express.Router())
  }
}