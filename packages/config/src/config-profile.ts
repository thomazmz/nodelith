import { ConfigRecord } from './config-record'
import { ConfigTupple } from './config-tupple'

export type ConfigProfile<T extends ConfigRecord = ConfigRecord> = {
  [k in keyof T]: ConfigTupple<T[k]>
}

export const ConfigProfile = Object.freeze({
  boolean(key: string, defaultValue?: boolean): ConfigTupple<boolean> {
    return [key, defaultValue]
  },
  number(key: string, defaultValue?: number): ConfigTupple<number> {
    return [key, defaultValue]
  },
  string(key: string, defaultString?: string): ConfigTupple<string> {
    return [key, defaultString]
  }
})
