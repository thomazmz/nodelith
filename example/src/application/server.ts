import { ExpressConfig } from '@nodelith/express'
import { ExpressServer } from '@nodelith/express'

import { ApplicationModule } from './module'
import { Logger } from './logger'

ExpressServer.for(ApplicationModule)
  .useConfig(ExpressConfig)
  .useLogger(Logger)
  .start()
