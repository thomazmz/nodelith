import { DeepPartial } from '@nodelith/types';
import { ConfigObject } from './config-object';

export type ConfigObjectDefaults<Config extends ConfigObject = ConfigObject> = DeepPartial<Config>;
