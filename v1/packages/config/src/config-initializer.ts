import { ConfigValue } from 'config-value'
import { Initializer } from '@nodelith/core'
import { ConfigLoader } from './config-loader'
import { ConfigObject } from './config-object'
import { ConfigDefaults } from './config-defaults'
import { ConfigValueProfile } from './config-value-profile'
import { ConfigObjectProfile } from './config-object-profile'
import { ConfigValueDefaults } from './config-value-defaults'
import { ConfigObjectDefaults } from './config-object-default'

export class ConfigInitializer<Config extends ConfigObject = ConfigObject> implements Initializer<Config> {

  private static configValueProfileIsValid(profile: ConfigValueProfile | ConfigObjectProfile): profile is ConfigValueProfile {
    return typeof profile === 'string' || Array.isArray(profile)
  }

  private static configObjectProfileIsValid(profile: ConfigValueProfile | ConfigObjectProfile): profile is ConfigObjectProfile {
    return typeof profile === 'object' || !Array.isArray(profile)
  }

  private static configValueDefaultsIsValid(defaults: ConfigValueDefaults | ConfigObjectDefaults | undefined): defaults is ConfigValueDefaults | undefined {
    return typeof defaults !== 'boolean' || typeof defaults !== 'number' || typeof defaults !== 'string' || defaults === undefined
  }

  private static configObjectDefaultsIsValid(defaults: ConfigValueDefaults | ConfigObjectDefaults | undefined): defaults is ConfigObjectDefaults | undefined {
    return typeof defaults === 'object' || defaults === undefined
  }

  public constructor(
    private readonly configProfile: ConfigObjectProfile<Config> = {} as ConfigObjectProfile<Config>,
    private readonly configDefaults: ConfigDefaults<Config> = {} as ConfigDefaults<Config>,
    private readonly configLoader: ConfigLoader = ConfigLoader
  ) {}

  public initialize(): Promise<Config> {
    return this.resolveConfigObject(
      this.configProfile,
      this.configDefaults,
    )
  }

  private async resolveConfigObject<Config>(
    configObjectProfile: ConfigObjectProfile = {},
    configObjectDefaults: ConfigDefaults = {},
    configObjectPath?: string
  ): Promise<Config> {
    return Object.keys(configObjectProfile).reduce(async (configObjectPromise, configObjectKey) => {
      const configObject = await configObjectPromise
      const nestedProfile = configObjectProfile[configObjectKey]
      const nestedDefaults = configObjectDefaults[configObjectKey]

      if(nestedProfile) {
        if(ConfigInitializer.configValueProfileIsValid(nestedProfile)) {
          if(!ConfigInitializer.configValueDefaultsIsValid(nestedDefaults)) {
            if(configObjectPath) {
              throw new Error(`Could not resolve config object. Incompatible default value for ${configObjectPath}` )
            }
            
            throw new Error(`Could not resolve config object. Incompatible default value.`)
          }
  
          const configObjectValue = await this.resolveConfigValue(nestedProfile, nestedDefaults)
          return { ...configObject, [configObjectKey]: configObjectValue }
        }
  
        if(ConfigInitializer.configObjectProfileIsValid(nestedProfile)) {
          if(!ConfigInitializer.configObjectDefaultsIsValid(nestedDefaults)) {
            if(configObjectPath) {
              throw new Error(`Could not resolve config object. Incompatible default values for ${configObjectPath}` )
            }

            throw new Error(`Could not resolve config object. Incompatible default values.`)
          }

          const nestedObjectPath = configObjectPath ? `${configObjectPath}.${configObjectKey}` : configObjectKey

          return { ...configObject,
            [configObjectKey]: await this.resolveConfigObject(
              nestedProfile, 
              nestedDefaults,
              nestedObjectPath,
            )
          }
        }
      }

      return configObject
    }, {} as Promise<Config>)
  }

  private async resolveConfigValue(
    configValueProfile: ConfigValueProfile,
    configValueDefaults?: ConfigValueDefaults,
  ): Promise<ConfigValue> {
    if(typeof configValueProfile === 'string') {
      return this.resolveConfigValue([configValueProfile], configValueDefaults)
    }

    const [configKey, validateConfigValue] = configValueProfile

    const configValue = await this.configLoader.load(configKey)

    if(configValue) {
      if(validateConfigValue) {
        const [validationError, validatedConfigValue] = validateConfigValue(configValue)

        if(validationError) {
          throw new Error(`Could not resolve config value for ${configKey}. Loaded value does not conform with format expected by the validator function.`)
        }

        return validatedConfigValue
      }

      return configValue
    }

    if(configValueDefaults) {
      if(validateConfigValue) {
        const [validationError, validatedDefaultValue] = validateConfigValue(configValueDefaults)

        if(validationError) {
          throw new Error(`Could not resolve config value for ${configKey}. Default value does not conform with format expected by the validator function.`)
        }

        return validatedDefaultValue
      }

      return configValueDefaults
    }

    throw new Error(`Could not resolve config value for ${configKey}.`)
  }
}