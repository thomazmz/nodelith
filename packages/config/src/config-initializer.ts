import { CoreInitializer } from '@nodelith/core'
import { CoreLoader } from '@nodelith/core'
import { ConfigProfile } from './config-profile'

import { ConfigRecord, ConfigRecordValue } from './config-record'
import { ConfigTupple } from './config-tupple'

export abstract class ConfigInitializer<T extends ConfigRecord> implements CoreInitializer<T> {

  protected abstract readonly profile: ConfigProfile<T>

  protected readonly loader?: CoreLoader<string> | undefined

  protected readonly env: CoreLoader<string> = Object.freeze({
    load: (key: string): undefined | string => process.env[key]
  })

  public constructor(configLoader?: CoreLoader<string>) {
    this.loader = configLoader
  }

  public async initialize(): Promise<T> {
    const record: ConfigRecord = {}

    for (const [key, tupple] of Object.entries(this.profile)) {
      record[key] = await this.resolve(tupple)
    }

    return record as T
  }

  private async resolve<T extends ConfigRecordValue>(configTupple: ConfigTupple<T>): Promise<T> {
    const [key, value, contract] = configTupple
    
    const unkownValue = await this.env.load(key) ?? this.loader?.load(key) ?? value

    const normalizationResult = contract.normalize(unkownValue)

    if(!normalizationResult.success) throw new Error(`Failed to load configuratoin for ${key}.`)

    return normalizationResult.value
  }
}
