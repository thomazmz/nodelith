import { ConfigInitializer } from '@nodelith/config';
import { ConfigProfile } from '@nodelith/config'

export type PetConfig = {
  defaultName: string
}

export class PetConfigInitializer extends ConfigInitializer<PetConfig> {
  public override readonly profile = Object.freeze({
    defaultName: ConfigProfile.string('PET_MODULE_DEFAULT_NAME', 'Unamed'),
  })
}
