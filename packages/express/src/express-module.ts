import express from 'express'
import { HttpStatus } from '@nodelith/http'
import { ConstructorUtils } from '@nodelith/utils'
import { HttpBadRequestError } from '@nodelith/http'
import { HttpInternalServerError } from '@nodelith/http'
import { InjectionFacade } from '@nodelith/injection'
import { InjectionModule } from '@nodelith/injection'
import { InjectionContext } from '@nodelith/injection'
import { InjectionRegistration } from '@nodelith/injection'
import { ControllerRootMetadata} from '@nodelith/controller'

export class ExpressModule extends InjectionModule {
  public static create(context?: InjectionContext): ExpressModule {
    return new ExpressModule(context ?? InjectionContext.create())
  }

  private readonly controllers: ConstructorUtils[] = []

  public useController(controller: ConstructorUtils): this {
    this.controllers.push(controller)
    return this
  }

  public resolveApplication(options?: InjectionRegistration.ResolutionOptions): express.Application {
    return express().use(this.resolveRouter(options))
  }

  public resolveRouter(options?: InjectionRegistration.ResolutionOptions): express.Router {
    return this.controllers.reduce((applicationRouter, constructor) => {
      const { path, routes} = ControllerRootMetadata.extract(constructor)

      const facade = InjectionFacade.create(this, constructor, options)

      return applicationRouter.use(path, routes.reduce((controllerRouter, metadata) => {
        if (!(metadata.key in facade)) return controllerRouter

        const handler: express.RequestHandler = (request, response, next) => {
          const argumentz = Object.values(metadata.inputs).map(parameter => {
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
            return facade[metadata.key](...argumentz)
          }).then((result: unknown) => {
            return metadata.success !== HttpStatus.NoContent
              ? response.status(metadata.success).json(result)
              : response.status(metadata.success).send()
          }).catch((error: Error) => {
            return next(error)
          })
        }

        return controllerRouter[metadata.method](metadata.path, express.json(), handler)
      }, express.Router()))
    }, express.Router())
  }
}
