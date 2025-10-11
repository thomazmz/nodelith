import { ValidationFunction } from '@nodelith/core';
import { ConfigValue } from 'config-value';

export type ConfigValueProfile<V extends ConfigValue = any> = string | [string] | [string, ValidationFunction<V>]
