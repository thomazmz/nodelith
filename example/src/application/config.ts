import { ExpressConfig } from "@nodelith/express";
import { ConfigProfile } from "@nodelith/config";

export class ApplicationConfig extends ExpressConfig {
  public override readonly profile = Object.freeze({
    name: ConfigProfile.string('APPLICATION_SERVER_NAME', 'Pet Service'),
    port: ConfigProfile.number('APPLICATION_SERVER_PORT', 4004),
  })
}
