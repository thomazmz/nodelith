import { CoreContract } from '@nodelith/core'
import { ConfigRecordValue } from './config-record'

export type ConfigTupple<T extends ConfigRecordValue = ConfigRecordValue> = readonly [string, T | undefined, CoreContract<T>]
