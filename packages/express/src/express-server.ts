import { ConstructorType } from '@nodelith/utilities';
import { ExpressModule } from '@nodelith/express';
import { CoreInitializer } from '@nodelith/core';
import { CoreLogger } from '@nodelith/core';

import { ExpressConfigRecord } from './express-config';

export class ExpressServer {
  public static for(module: ExpressModule) {
    return new ExpressServer(module.clone())
  }

  private readonly module: ExpressModule

  private constructor(module: ExpressModule) {
    this.module = module.clone()
  }

  public useConfig(initializer: ConstructorType<CoreInitializer<ExpressConfigRecord>>): this {
    this.module.mapClassInitializer('applicationConfig', initializer)
    return this
  }

  public useLogger(logger: ConstructorType<CoreLogger>): this {
    this.module.mapClassRegistration('applicationLogger', logger)
    return this
  }

  public async start(): Promise<void> {
    await this.module.initialize()
  
    const app = this.module.resolveApplication()
    const logger = this.module.resolve<CoreLogger>('applicationLogger')
    const config = this.module.resolve<ExpressConfigRecord>('applicationConfig')
  
    app.listen(config.port, () => {
      logger.info(`${config.name} running on port ${config.port}.`)
    })
  }
}