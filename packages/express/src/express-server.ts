import { ConstructorType } from '@nodelith/utilities'
import { ExpressModule } from '@nodelith/express'
import { CoreInitializer } from '@nodelith/core'
import { CoreLogger } from '@nodelith/core'

import { ExpressConfig } from './express-config'

export class ExpressServer {
  public static for(module: ExpressModule) {
    return new ExpressServer(module.clone())
  }

  private readonly module: ExpressModule

  private constructor(module: ExpressModule) {
    this.module = module.clone()
  }

  public useConfig(initializer: ConstructorType<CoreInitializer<ExpressConfig>>): this {
    this.module.mapClassInitializer('config', initializer)
    return this
  }

  public useLogger(logger: ConstructorType<CoreLogger>): this {
    this.module.mapClassRegistration('logger', logger)
    return this
  }

  public async start(): Promise<void> {
    await this.module.initialize()
  
    const logger = this.module.resolve<CoreLogger>('logger')

    if(!logger) {
      throw new Error('Could not start express server. The server module is missing a valid logger registration.')
    }

    const config = this.module.resolve<ExpressConfig>('config')

    if(!config) {
      throw new Error('Could not start express server. The server module is missing a valid config registration.')
    }

    const app = this.module.resolveApplication(config)

    app.listen(config.port, () => {
      logger.info(`${config.name} running on port ${config.port}.`)
    })
  }
}
