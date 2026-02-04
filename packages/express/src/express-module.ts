import express from 'express'
import cors from 'cors'

import { ControllerRootMetadata } from '@nodelith/controller'
import { HttpInternalServerError } from '@nodelith/http'
import { HttpBadRequestError } from '@nodelith/http'
import { InjectionContext } from '@nodelith/injection'
import { InjectionModule } from '@nodelith/injection'
import { ConstructorType } from '@nodelith/utilities'
import { InjectionTrace } from '@nodelith/injection'
import { FunctionType } from '@nodelith/utilities'
import { HttpStatus } from '@nodelith/http'

import { ExpressConfig } from './express-config'

export declare namespace ExpressModule {
  export type DeclarationOptions = {
    context: InjectionContext
    stack: InjectionTrace
  }
}

export class ExpressModule extends InjectionModule {
  private static readonly REQUEST_CONTEXT_KEY = Symbol()

  private static extractRequestContext(request: express.Request & {
    [ExpressModule.REQUEST_CONTEXT_KEY]?: InjectionContext
  }): InjectionContext {
    const context = request[ExpressModule.REQUEST_CONTEXT_KEY] ?? InjectionContext.create()
    return request[ExpressModule.REQUEST_CONTEXT_KEY] = context
  }

  public static override create(options?: Partial<ExpressModule.DeclarationOptions>): ExpressModule {
    return new ExpressModule({
      stack: options?.stack ?? InjectionTrace.create(),
      context: options?.context ?? InjectionContext.create(),
    })
  }

  private readonly controllers: ConstructorType[] = []

  private readonly errorHandlers: FunctionType<express.ErrorRequestHandler>[] = []
  
  private readonly requestHandlers: FunctionType<express.RequestHandler>[] = []

  public useController(controller: ConstructorType): this {
    this.controllers.push(controller)
    return this
  }

  public useControllers(controllers: ConstructorType[]): this {
    controllers.forEach((controller) => this.useController(controller))
    return this
  }

  public useRequestHandler(handler: FunctionType<express.RequestHandler>): this {
    this.requestHandlers.push(handler)
    return this
  }

  public useRequestHandlers(handlers: FunctionType<express.RequestHandler>[]): this {
    handlers.forEach((handler) => this.useRequestHandler(handler))
    return this
  }

  public useErrorHandler(handler: FunctionType<express.ErrorRequestHandler>): this {
    this.errorHandlers.push(handler)
    return this
  }

  public useErrorHandlers(handlers: FunctionType<express.ErrorRequestHandler>[]): this {
    handlers.forEach((handler) => this.useErrorHandler(handler))
    return this
  }

  public resolveApplication(expressConfig?: ExpressConfig): express.Application {
    return express().use(this.resolveRouter(expressConfig))
  }

  public resolveRouter(expressConfig?: ExpressConfig): express.Router {
    const bodyHandler = express.json()

    const corsHandler = cors({
      ...((typeof expressConfig?.allowedOrigins !== 'undefined') && { origin: expressConfig?.allowedOrigins }),
      ...((typeof expressConfig?.allowedMethods !== 'undefined') && { methods: expressConfig?.allowedMethods }),
      ...((typeof expressConfig?.allowedHeaders !== 'undefined') &&  { allowedHeaders: expressConfig?.allowedHeaders }),
    })

    return this.controllers.reduce((applicationRouter, constructor) => {
      const { path, routes} = ControllerRootMetadata.extract(constructor)

      const requestHandlers = this.resolveRequestHandlers()
      
      if (requestHandlers.length > 0) {
        applicationRouter.use(...requestHandlers)
      }

      applicationRouter.use(path, routes.reduce((router, metadata) => {
        const handler: express.RequestHandler = (request, response, next) => {
          const controller = this.resolveClass(constructor, {
            context: ExpressModule.extractRequestContext(request)
          }) as any

          if(!(metadata.key in controller) || typeof controller[metadata.key] !== 'function') {
            HttpInternalServerError.throw(`Could not handle request. Controller does not specify a valid handler method for ${metadata.key}.`)
          }

          const args = Object.values(metadata.inputs).map((parameter: string) => {
            if(parameter === 'headers') {
              if(!metadata.header) HttpInternalServerError.throw(
                `Could not provide a "headers" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Headers annotation is assigned to the route method.`
              )

              const result = metadata.header.parse(request.headers)
              
              if(!result.success) HttpBadRequestError.throw(
                `Bad request. Could not parse request headers.`
              )

              return result;
            }

            if(parameter === 'query') {
              if(!metadata.query) HttpInternalServerError.throw(
                `Could not provide a "query" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Query annotation is assigned to the route method.`
              )

              const result = metadata.query.parse(request.query)
              
              if(!result.success) HttpBadRequestError.throw(
                `Bad request. Could not parse request query.`
              )

              return result;
            }

            if(parameter === 'body') {
              if(!metadata.body) HttpInternalServerError.throw(
                `Could not provide a "body" parameter to ${constructor.name}:${metadata.key}. Ensure a @Controller.Body annotation is assigned to the route method.`
              )

              const result = metadata.body.parse(request.body)
              
              if(!result.success) HttpBadRequestError.throw(
                `Bad request. Could not parse request body.`
              )

              return result;
            }

            return request.params[parameter] ? request.params[parameter] : HttpInternalServerError.throw(
              `Could not provide a path parameter to ${constructor.name}:${metadata.key}. The request does not contain a path parameter for "${parameter}".`
            )
          })

          return Promise.resolve().then(() => {
            return controller[metadata.key](...args)
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
    }, express.Router().use(corsHandler, bodyHandler))
  }

  protected resolveRequestHandlers(): express.RequestHandler[] {
    return this.requestHandlers.map(handler => {
      return (request, response, next) => {
        return this.resolveFunction(handler, {
          context: ExpressModule.extractRequestContext(request)
        })(request, response, next)
      }
    })
  }

  protected resolveErrorHandlers(): express.ErrorRequestHandler[] {
    return this.errorHandlers.map(handler => {
      return (error, request, response, next) => {
        return this.resolveFunction(handler, {
          context: ExpressModule.extractRequestContext(request)
        })(error, request, response, next)
      }
    })
  }

  public override clone(options?: Partial<InjectionModule.DeclarationOptions>): ExpressModule {
    const module = ExpressModule.create(options)
    module.useRequestHandlers(this.requestHandlers)
    module.useErrorHandlers(this.errorHandlers)
    module.useRegistrations(this.registrations)
    module.useControllers(this.controllers)
    module.useModules(this.modules)
    return module
  }
}
