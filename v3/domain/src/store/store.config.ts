import { Core }  from '@refresh/framework/core'

export type StoreConfig = Core.Config<InstanceType<typeof StoreConfigInitializer>['profile']>

export class StoreConfigInitializer extends Core.ConfigInitializer {
  protected readonly profile = Core.Config.profile({
    defaultName: Core.Config.string('REFRESH_STORE_DEFAULT_NAME', 'The Cool Store!'),
    defaultSlug: Core.Config.string('REFRESH_STORE_DEFAULT_SLUG', 'TheCoolStore'),
  })
}
