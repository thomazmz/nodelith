import { CoreLogger } from '@nodelith/core'
import { HttpClientError, HttpMessage, HttpResponse, HttpServerError, HttpStatus } from '@nodelith/http'
import express from 'express'

export function errorHandler(applicationLogger: CoreLogger): express.ErrorRequestHandler {
  return (error: Error, _request, response, next) => {
    if(error instanceof HttpClientError) {
      applicationLogger.debug(error.message)
      return response.status(error.status).send({
        status: error.status,
        message: error.message,
        details: error.details,
      })
    }

    if(error instanceof HttpServerError) {
      applicationLogger.error(error.message)
      return response.status(error.status).send({
        message: error.message,
        status: error.status,
      })
    }

    return response.status(HttpStatus.InternalServerError).send({
      message: HttpMessage.InternalServerError,
      status: HttpStatus.InternalServerError,
    })
  }
}