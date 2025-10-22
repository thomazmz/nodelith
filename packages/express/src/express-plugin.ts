import express from 'express'
import { InjectionFacade } from '@nodelith/injection'
import { InjectionBundle } from '@nodelith/injection'
import { ConstructorUtils } from '@nodelith/utils'
import { ExpressModule } from './express-module'

export type ExpressPluginRecord = Record<string, ConstructorUtils>

export type ExpressPluginActions<T extends ExpressPluginRecord> = {
  [k in keyof T]: InjectionFacade<InstanceType<T[k]>>
}

export type ExpressPlugin<T extends ExpressPluginRecord> = {
  router: express.Router,
  bind: () => ExpressPluginActions<T>
  terminate: ExpressModule['terminate']
  initialize: ExpressModule['initialize']
};

export const ExpressPlugin = {
  bind: bindExpressActions,
  create: createExpressPlugin
}


export function bindExpressActions<T extends ExpressPluginRecord>(module: ExpressModule, constructors: T, bundle?: InjectionBundle): ExpressPluginActions<T> {
  return Object.entries(constructors).reduce((actions, [key, constructor]) => {
    return Object.defineProperty(actions, key, {
      value: InjectionFacade.create(module, constructor, bundle),
      configurable: false,
      enumerable: true,
    })
  }, {} as ExpressPluginActions<T>)
}

export function createExpressPlugin<T extends ExpressPluginRecord>(module: ExpressModule, constructors: T): ExpressPlugin<T> {
  const router = module.resolveRouter()

  return Object.freeze({ router,
    bind: () => {
      return ExpressPlugin.bind(module, constructors)
    },
    terminate: () => {
      return module.terminate()
    },
    initialize: () => {
      return module.initialize()
    },
  })
}
