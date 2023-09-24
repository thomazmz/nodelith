import * as Joi from 'joi'
import * as Express from 'express';
import { Function } from '@core-fusion/context'
import { JoiValidator } from '@core-fusion/joi'
import { FunctionUtils } from '@core-fusion/utils';
import { HttpCode, HttpOk, InvalidRequestBodyError, UnauthorizedError } from '@core-fusion/http'
import { ControllerRequest } from './controller-request';

export function createControllerRequestHandler<C>(instance: C, key: keyof C, httpCode?: HttpCode): Express.RequestHandler | undefined {

  function createRequestHandlerArgumentMapper(requestMethod?: Function): (
    request: ControllerRequest,
    response: Express.Response
  ) => string[] {
    return (request: ControllerRequest, response: Express.Response) => {
      const requestArguments = requestMethod? FunctionUtils.extractArguments(requestMethod) : []
      return requestArguments.map((argumentIdentifier: string) => {
        return {
          req: request,
          res: request,
          request: request,
          response: response,
          body: request.body,
          query: request.query,
          params: request.params,
          principal: request.principal
        }[argumentIdentifier] ?? request.params[argumentIdentifier]
      })
    }
  }

  const argumentMapper = createRequestHandlerArgumentMapper(instance[key] as Function)

  return function routeHandler(request: ControllerRequest, response: Express.Response, next: Express.NextFunction) {
    const argumentMap = argumentMapper(request, response)
    Promise.resolve((instance[key] as Function)(...argumentMap))
      .then((result) => response.status(httpCode ?? HttpOk.code).send(result))
      .catch(next)
  }
}

export function createBodySchemaRequestHandler(schema: Joi.Schema): Express.RequestHandler {
  const validator = new JoiValidator(schema, InvalidRequestBodyError)

  return (req: ControllerRequest, _: Express.Response, next: Express.NextFunction) => {
    if(validator.assert(req.body)) {
      return next()
    }
  }
}

export function createPrincipalAuthorizationRequestHandler(...principalTypes: Array<string>): Express.RequestHandler {
  return (req: ControllerRequest, _: Express.Response, next: Express.NextFunction) => {
    if(!req.principal?.type || !principalTypes.includes(req.principal?.type)) {
      throw new UnauthorizedError('Invalid Authorization Principal')
    }

     next()
  }
}