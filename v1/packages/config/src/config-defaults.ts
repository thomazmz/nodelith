import Types from '@nodelith/types';
import { ConfigObject } from './config-object';

export type ConfigDefaults<Config extends ConfigObject = ConfigObject> = Types.DeepPartial<Config>;
