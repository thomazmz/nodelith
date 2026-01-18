import { ConfigInitializer } from '@nodelith/config';
import { ConfigProfile } from '@nodelith/config';

export type ExpressConfig = {
  readonly name: string
  readonly port: number
}

export class ExpressConfigInitializer extends ConfigInitializer<ExpressConfig> {
  public readonly profile: ConfigProfile<ExpressConfig> = Object.freeze({
    name: ConfigProfile.string('EXPRESS_SERVER_NAME', 'Server'),
    port: ConfigProfile.number('EXPRESS_SERVER_PORT', 3000),
  })
}
