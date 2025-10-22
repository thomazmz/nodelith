import { ExpressServer, createExpressServer } from './express-server'
import { ExpressModule } from './express-module'

describe('ExpressServer', () => {
  it('should create a new server instance', () => {
    const module = ExpressModule.create()
    const server = ExpressServer.create(module)

    expect(server).toBeDefined()
    expect(server.initialize).toBeInstanceOf(Function)
    expect(server.terminate).toBeInstanceOf(Function)
  })

  it('should initialize the server', async () => {
    const module = ExpressModule.create()
    const server = createExpressServer(module)

    const listenSpy = jest.fn((port, callback) => {
      callback?.()
      return {} as any
    })

    const app = module.resolveApplication()
    app.listen = listenSpy as any

    await server.initialize(3000)

    expect(listenSpy).toHaveBeenCalledWith(3000, expect.any(Function))
  })

  it('should terminate the server', async () => {
    const module = ExpressModule.create()
    const server = createExpressServer(module)

    const terminateSpy = jest.spyOn(module, 'terminate')

    await server.terminate()

    expect(terminateSpy).toHaveBeenCalledTimes(1)
  })
})

