import { ExpressServer } from '@nodelith/express'
import { ApplicationModule } from './module'
import { ApplicationConfig } from './config'
import { ApplicationLogger } from './logger'

ExpressServer.for(ApplicationModule)
  .useConfig(ApplicationConfig)
  .useLogger(ApplicationLogger)
  .start()
