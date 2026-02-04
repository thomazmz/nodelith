import { ConfigRecord } from './config-record'
import { ConfigTupple } from './config-tupple'
import { Contract } from '@nodelith/contract'

export type ConfigProfile<T extends ConfigRecord = ConfigRecord> = {
  [k in keyof T]: ConfigTupple<T[k]>
}

export const ConfigProfile = Object.freeze({
  boolean(key: string, defaultBoolean?: boolean): ConfigTupple<boolean> {
    return ConfigProfile.requiredBoolean(key, defaultBoolean)
  },
  number(key: string, defaultNumber?: number): ConfigTupple<number> {
    return ConfigProfile.requiredNumber(key, defaultNumber)
  },
  string(key: string, defaultString?: string): ConfigTupple<string> {
    return ConfigProfile.requiredString(key, defaultString)
  },
  requiredBoolean(key: string, defaultBoolean?: boolean): ConfigTupple<boolean> {
    return [key, defaultBoolean, Contract.boolean()]
  },
  requiredNumber(key: string, defaultNumber?: number): ConfigTupple<number> {
    return [key, defaultNumber, Contract.number()]
  },
  requiredString(key: string, defaultString?: string): ConfigTupple<string> {
    return [key, defaultString, Contract.string()]
  },
  optionalBoolean(key: string, defaultBoolean?: boolean): ConfigTupple<boolean | undefined> {
    return [key, defaultBoolean, Contract.boolean().optional()]
  },
  optionalNumber(key: string, defaultNumber?: number): ConfigTupple<number | undefined> {
    return [key, defaultNumber, Contract.number().optional()]
  },
  optionalString(key: string, defaultString?: string): ConfigTupple<string | undefined> {
    return [key, defaultString, Contract.string().optional()]
  }
})
