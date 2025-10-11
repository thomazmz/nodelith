import { CoreConfig } from './core-config'
import { CoreInitializer } from './core-initializer'

export abstract class CoreConfigInitializer<T extends CoreConfig.Profile = CoreConfig.Profile> implements CoreInitializer {
  protected abstract readonly profile: T

  protected readonly loader: CoreConfig.Loader = Object.freeze({
    load: (key: string): undefined | string => process.env[key]
  })

  private async _initialize(
    configProfile: CoreConfig.Profile,
    configLoader: CoreConfig.Loader,
  ): Promise<T> {
    return Object.keys(configProfile).reduce(async (
      configPromise: Promise<T>,
      configKey: CoreConfig.Key,
    ) => {
      const configObject = await configPromise
      const configEntry = configProfile[configKey]

      if (!(Array.isArray(configEntry))) {
        return { ...configObject,
          [configKey]: await this._initialize(
            configEntry as CoreConfig.Profile,
            configLoader,
          )
        }
      }

      const [key, validator, defaultValue] = configEntry as CoreConfig.Tupple

      const rawValue = await configLoader?.load(key)

      const parsedValue = validator.parse(rawValue ?? defaultValue)

      return { ...configObject, [configKey]: parsedValue }
    }, Promise.resolve({} as T))
  }

  public async initialize(): Promise<T> {
    return this._initialize(
      this.profile,
      this.loader,
    )
  }
}
