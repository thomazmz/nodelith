import express from 'express'
import * as Types from '@nodelith/types'
import * as Express from './router-module'

export class ServerModule extends Express.RouterModule {
  public async initialize(): Promise<void> {
    // await super.initialize()
  
    this.resolveApplication().listen(3003, () => {
      console.log('Application running on port 3003')
    })
  }
  
  public resolveApplication(...controllers: Types.Constructor[]): express.Express {
    const requestHandlers = this.resolveRequestHandlers()
    const requestRoutes = this.resolveRouter(...controllers)
    const errorHandlers = this.resolveRequestErrorHandlers()
    return express().use(
      requestHandlers,
      requestRoutes, 
      errorHandlers,
    )
  }
}
