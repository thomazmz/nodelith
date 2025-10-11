import * as Express from '@nodelith/express'
import * as Controllers from './controllers'

export const Module = new Express.ServerModule()
Module.useController(Controllers.PetController)
