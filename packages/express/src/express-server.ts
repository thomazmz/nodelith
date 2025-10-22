import { ExpressModule } from './express-module'

export type ExpressServer = {
  initialize: (port: number) => Promise<void>
  terminate: () => Promise<void>
}

export const ExpressServer = Object.freeze({
  create: createExpressServer
})

export function createExpressServer(module: ExpressModule): ExpressServer {
  const express = module.resolveApplication()

  async function initialize(port: number) {
    await module.initialize()
    express.listen(port, () => {
      console.log(`Listening on port ${port}`)
    })
  }

  async function terminate() {
    await module.terminate()
  }

  return Object.freeze({
    initialize,
    terminate,
  })
}
