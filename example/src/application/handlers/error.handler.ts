import { CoreLogger } from '@nodelith/core'
import express from 'express'

export function errorHandler(applicationLogger: CoreLogger): express.ErrorRequestHandler {
  return (_error: Error, _request, _response, next): void => {
    applicationLogger.error(_error.message)
    next()
  }
}