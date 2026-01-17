import { CoreInitializer } from '@nodelith/core'
import { CoreLoader } from '@nodelith/core'
import { ConfigProfile } from './config-profile'

import { ConfigRecord } from './config-record'

export abstract class ConfigInitializer<T extends ConfigRecord> implements CoreInitializer<T> {

  protected abstract readonly profile: ConfigProfile<T>

  protected readonly customLoader?: CoreLoader<string> | undefined

  protected readonly environmentLoader: CoreLoader<string> = Object.freeze({
    load: (key: string): undefined | string => process.env[key]
  })

  public constructor(configLoader?: CoreLoader<string>) {
    this.customLoader = configLoader
  }

  public async initialize(): Promise<T> {
    return Object.fromEntries(Object.entries(this.profile).map(([recordKey, [configKey, defaultValue]]) => {
      return [recordKey, this.environmentLoader.load(configKey) ?? this.customLoader?.load(configKey) ?? defaultValue]
    })) as T
  }
}
