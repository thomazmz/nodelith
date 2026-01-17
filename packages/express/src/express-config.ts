import { ConfigInitializer } from '@nodelith/config';
import { ConfigProfile } from '@nodelith/config';

export type ExpressConfigRecord = {
  readonly name: string
  readonly port: number
}

export class ExpressConfig extends ConfigInitializer<ExpressConfigRecord> {
  public static readonly DEFAULT_PROFILE = Object.freeze({
    name: ConfigProfile.string('EXPRESS_SERVER_NAME', 'Server'),
    port: ConfigProfile.number('EXPRESS_SERVER_PORT', 3000),
  })

  public readonly profile: ConfigProfile<ExpressConfigRecord> = ExpressConfig.DEFAULT_PROFILE
}
