import { ConfigInitializer } from '@nodelith/config';
import { ConfigProfile } from '@nodelith/config'

export type PetConfig = {
  defaultAge: number
  defaultName: string
}

export class PetConfigInitializer extends ConfigInitializer<PetConfig> {
  public override readonly profile = Object.freeze({
    defaultAge: ConfigProfile.number('PET_MODULE_DEFAULT_AGE', 0),
    defaultName: ConfigProfile.string('PET_MODULE_DEFAULT_NAME', 'Unamed'),
  })
}
