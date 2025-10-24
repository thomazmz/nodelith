import express from 'express'
import { HttpStatus } from '@nodelith/http'
import { FactoryUtils } from '@nodelith/utils'
import { ConstructorUtils } from '@nodelith/utils'
import { HttpBadRequestError } from '@nodelith/http'
import { HttpInternalServerError } from '@nodelith/http'
import { ControllerRootMetadata} from '@nodelith/controller'
import { InjectionContext } from '@nodelith/injection'
import { InjectionModule } from '@nodelith/injection'

export class ExpressModule extends InjectionModule {
  private static readonly REQUEST_CONTEXT_KEY = Symbol()

  private static extractContext(request: express.Request): InjectionContext {
    if(request[ExpressModule.REQUEST_CONTEXT_KEY]) return request[ExpressModule.REQUEST_CONTEXT_KEY]
    return request[ExpressModule.REQUEST_CONTEXT_KEY] = InjectionContext.create()
  }

  public static create(context?: InjectionContext): ExpressModule {
    return new ExpressModule(context ?? InjectionContext.create())
  }

  private readonly controllers: ConstructorUtils[] = []

  private readonly errorHandlers: FactoryUtils<express.ErrorRequestHandler>[] = []
  
  private readonly requestHandlers: FactoryUtils<express.RequestHandler>[] = []

  public useController(controller: ConstructorUtils): this {
    this.controllers.push(controller)
    this.useClass(controller)
    return this
  }

  public useRequestHandler(handler: FactoryUtils<express.RequestHandler>): this {
    this.requestHandlers.push(handler)
    this.useFunction(handler)
    return this
  }

  public useErrorHandler(handler: FactoryUtils<express.ErrorRequestHandler>): this {
    this.errorHandlers.push(handler)
    this.useFunction(handler)
    return this
  }

  public resolveApplication(): express.Application {
    return express().use(this.resolveRouter())
  }

  public resolveRouter(): express.Router {
    return this.controllers.reduce((applicationRouter, constructor) => {
      const { path, routes} = ControllerRootMetadata.extract(constructor)

      const requestHandlers = this.resolveRequestHandlers()
      
      if (requestHandlers.length > 0) {
        applicationRouter.use(...requestHandlers)
      }

      applicationRouter.use(path, routes.reduce((router, metadata) => {
        const handler: express.RequestHandler = (request, response, next) => {
          const controller = this.resolve(constructor, {
            context: ExpressModule.extractContext(request)
          })

          if (!(metadata.key in controller) || typeof controller[metadata.key] !== 'function') {
            return next()
          }

          const argumentz = Object.values(metadata.inputs).map((parameter: string) => {
            if(parameter === 'headers') {
              return metadata.header ? metadata.header.parse(request.headers, HttpBadRequestError) : HttpInternalServerError.throw(
                `Could not provide a "headers" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Headers annotation is assigned to the route method.`
              )
            }

            if(parameter === 'query') {
              return metadata.query ? metadata.query.parse(request.query, HttpBadRequestError) : HttpInternalServerError.throw(
                `Could not provide a "query" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Query annotation is assigned to the route method.`
              )
            }

            if(parameter === 'body') {
              return metadata.body ? metadata.body.parse(request.body, HttpBadRequestError) : HttpInternalServerError.throw(
                `Could not provide a "body" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Body annotation is assigned to the route method.`
              )
            }

            return request.params[parameter] ? request.params[parameter] : HttpInternalServerError.throw(
              `Could not provide a path parameter to ${constructor.name}:${metadata.key}. The request does not contain a path parameter for "${parameter}".`
            )
          })

          return Promise.resolve().then(() => {
            return controller[metadata.key](...argumentz)
          }).then((result: unknown) => {
            return metadata.success !== HttpStatus.NoContent
              ? response.status(metadata.success).json(result)
              : response.status(metadata.success).send()
          }).catch((error: Error) => {
            return next(error)
          })
        }

        return router[metadata.method](metadata.path, handler)
      }, express.Router()))

      const errorHandlers = this.resolveErrorHandlers()
      
      if (errorHandlers.length > 0) {
        applicationRouter.use(...errorHandlers)
      }

      return applicationRouter
    }, express.Router().use(express.json()))
  }

  protected resolveRequestHandlers(): express.RequestHandler[] {
    return this.requestHandlers.map(factory => {
      return (request, response, next) => {
        return this.resolve(factory, {
          context: ExpressModule.extractContext(request)
        })(request, response, next)
      }
    })
  }

  protected resolveErrorHandlers(): express.ErrorRequestHandler[] {
    return this.errorHandlers.map(factory => {
      return (error, request, response, next) => {
        return this.resolve(factory, {
          context: ExpressModule.extractContext(request)
        })(error, request, response, next)
      }
    })
  }
}
