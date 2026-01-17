import { ExpressServer } from '@nodelith/express'
import { ApplicationModule } from './application.module'
import { ApplicationConfig } from './application.config'
import { ApplicationLogger } from './application.logger'

ExpressServer.for(ApplicationModule)
  .useConfig(ApplicationConfig)
  .useLogger(ApplicationLogger)
  .start()
