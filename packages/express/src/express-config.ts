import { ConfigInitializer } from '@nodelith/config';
import { ConfigProfile } from '@nodelith/config';

export type ExpressConfig = {
  readonly name: string
  readonly port: number
  readonly allowedOrigins?: string
  readonly allowedMethods?: string
  readonly allowedHeaders?: string
}

export class ExpressConfigInitializer extends ConfigInitializer<ExpressConfig> {
  public readonly profile: ConfigProfile<ExpressConfig> = Object.freeze({
    port: ConfigProfile.number('EXPRESS_SERVER_PORT', 3000),
    name: ConfigProfile.string('EXPRESS_SERVER_NAME', 'Server'),
    allowedOrigins: ConfigProfile.string('EXPRESS_SERVER_ALLOWED_ORIGIN', '*'),
    allowedMethods: ConfigProfile.string('EXPRESS_SERVER_ALLOWED_METHODS'),
    allowedHeaders: ConfigProfile.string('EXPRESS_SERVER_ALLOWED_HEADERS'),
  })
}
