import { DeepRecord } from '@nodelith/types';
import { ConfigValue } from 'config-value';

export type ConfigObject = DeepRecord<string, ConfigValue>
