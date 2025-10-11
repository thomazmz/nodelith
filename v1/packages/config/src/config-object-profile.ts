import { ConfigValue } from './config-value'
import { ConfigObject } from './config-object'
import { ConfigValueProfile } from './config-value-profile'

export type ConfigObjectProfile<C extends ConfigObject = ConfigObject> = {
  [k in keyof C]: 
    C[k] extends ConfigValue ? ConfigValueProfile<C[k]> : 
    C[k] extends ConfigObject ? ConfigObjectProfile<C[k]> :
    ConfigValueProfile  | ConfigObjectProfile
}
