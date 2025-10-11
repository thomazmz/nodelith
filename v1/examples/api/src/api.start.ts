import * as Injection from '@nodelith/container'
import * as Infrastructure from './infrastructure'
import * as Application from './application'
import * as Domain from './domain'

const api = new Injection.Module()

api.useModule(Infrastructure.Module)
api.useModule(Application.Module)
api.useModule(Domain.Module)
api.initialize()
