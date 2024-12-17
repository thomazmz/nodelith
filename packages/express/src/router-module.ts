import express from 'express'
import * as Http from '@nodelith/http'
import * as Types from '@nodelith/types'
import * as Utilities from '@nodelith/utilities'
import * as Container from '@nodelith/container'
import * as Controller from '@nodelith/controller'

export class RouterModule extends Container.Module {

  private readonly controllers: Types.Constructor[] = []

  private readonly requestHandlers: Types.Factory<express.RequestHandler>[] = []

  private readonly errorHandlers: Types.Factory<express.ErrorRequestHandler>[] = []

  public useController(controller: Types.Constructor): void {
    this.controllers.push(controller)
  }

  public useRequestHandler(handlerFactory: Types.Factory<express.RequestHandler>): void {
    this.requestHandlers.push(handlerFactory)
  }

  public useErrorHandler(handlerFactory: Types.Factory<express.ErrorRequestHandler>): void {
    this.errorHandlers.push(handlerFactory)
  }

  public resolveRouter(...controllers: Types.Constructor[]): express.Router {
    if(controllers.length === 0 && this.controllers.length >= 0) {
      return this.resolveRouter(...this.controllers)
    }

    return controllers.reduce((wrapperRouter, constructor) => {
      const classMetadata = Controller.ClassMetadata.extract(constructor)

      if(classMetadata.path) {
        wrapperRouter.use(classMetadata.path, this.resolveControllerRouter(constructor))
      }

      return wrapperRouter
    }, express.Router())
  }

  protected resolveControllerRouter(controller: Types.Constructor): express.Router {
    const controllerInstance = this.provideConstructor(controller)

    const propertyDescriptors = Object.getOwnPropertyDescriptors(controller.prototype)

    const propertyDescriptorEntries = Object.entries(propertyDescriptors)

    return propertyDescriptorEntries.reduce((controllerRouter, [ key, descriptor ]) => {

      const { path, method } = Controller.MethodMetadata.extract(descriptor)

      if(method && path && typeof controllerInstance[key] === 'function') {
        controllerRouter[method](path, this.resolveControllerRequestHandler(controllerInstance, key));
      }

      return controllerRouter
    }, express.Router())
  }

  protected resolveControllerRequestHandler<C>(controllerInstance: C, key: string): express.RequestHandler {
    const routeArgumentsMapper = this.createRouteArgumentMapper(controllerInstance[key] as Types.Function)
    return function(request: express.Request, response: express.Response, next: express.NextFunction) {
      const mappedRequestArguments = routeArgumentsMapper(request, response)
      Promise.resolve((controllerInstance[key] as Types.Function)(...mappedRequestArguments))
        .then((result) => response.status(Http.Code.Ok).send(result))
        .catch(next)
    }
  }

  protected createRouteArgumentMapper(requestMethod?: Types.Function) {
    return function (request: express.Request, response: express.Response) {
      const requestArguments = requestMethod ? Utilities.FunctionUtils.extractArguments(requestMethod) : []
      return requestArguments.map((argumentIdentifier: string) => {
        return {
          req: request,
          res: request,
          request: request,
          response: response,
          body: request.body,
          query: request.query,
          params: request.params,
          headers: request.headers,
        }[argumentIdentifier] ?? request.params[argumentIdentifier]
      })
    }
  }

  protected resolveRequestHandlers(): express.RequestHandler[] {
    return this.requestHandlers.map(handlerFactory => {
      const handler = this.provideFactory(handlerFactory)
      return (request, response, next) => {
        Promise.resolve(handler(request, response, next)).catch(next)
      }
    })
  }

  protected resolveRequestErrorHandlers(): express.ErrorRequestHandler[] {
    return this.errorHandlers.map(errorHandlerFactory => {
      const errorHandler = this.provideFactory(errorHandlerFactory)
      return (error, request, response, next) => {
        Promise.resolve(errorHandler(error, request, response, next)).catch(next)
      }
    })
  }
}
