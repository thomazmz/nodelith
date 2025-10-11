import * as Core from '@nodelith/core';
import { ConfigDefaults } from './config-defaults';
import { ConfigInitializer } from './config-initializer';
import { ConfigObjectProfile } from './config-object-profile';

describe('ConfigInitializer', () => {

  const validator: Core.ValidationFunction = (value: unknown) => {
    return [ undefined, value as string ]
  }

  const configLoaderMock = {
    load(key: string): string | undefined {
      return {
        'CONFIG_VALUE_H': 'config-value-h',
        'CONFIG_VALUE_I': 'config-value-i',
        'CONFIG_VALUE_J': 'config-value-j',
        'NESTED_CONFIG_VALUE_L': 'nested-config-value-l',
        'NESTED_CONFIG_VALUE_M': 'nested-config-value-m',
        'NESTED_CONFIG_VALUE_N': 'nested-config-value-n',
      }[key]
    }
  }

  it('should load values from configDefaults', async () => {
    const defaultValues: ConfigObjectProfile = {
      configValue_a: 'CONFIG_VALUE_A',
      configValue_b: ['CONFIG_VALUE_B'],
      configValue_c: ['CONFIG_VALUE_C', validator],
      configValue_d : {
        nestedConfigValue_e: 'NESTED_CONFIG_VALUE_E',
        nestedConfigValue_f: ['NESTED_CONFIG_VALUE_F'],
        nestedConfigValue_g: ['NESTED_CONFIG_VALUE_G', validator],
      }
    }

    const configDefaults: ConfigDefaults = {
      configValue_a: 'default-config-value-a',
      configValue_b: 'default-config-value-b',
      configValue_c: 'default-config-value-c',
      configValue_d: {
        nestedConfigValue_e: 'default-nested-config-value-e', 
        nestedConfigValue_f: 'default-nested-config-value-f',
        nestedConfigValue_g: 'default-nested-config-value-g',
      }
    }

    const configInitializer = new ConfigInitializer(
      defaultValues,
      configDefaults,
      configLoaderMock,
    )

    const initializedConfig = await configInitializer.initialize();
    expect(initializedConfig).toEqual(configDefaults)
  })

  it('should load values from configLoader', async () =>  {
    const configProfile: ConfigObjectProfile = {
      configValue_h: 'CONFIG_VALUE_H',
      configValue_i: ['CONFIG_VALUE_I'],
      configValue_j: ['CONFIG_VALUE_J', validator],
      configValue_k : {
        nestedConfigValue_l: 'NESTED_CONFIG_VALUE_L',
        nestedConfigValue_m: ['NESTED_CONFIG_VALUE_M'],
        nestedConfigValue_n: ['NESTED_CONFIG_VALUE_N', validator],
      }
    }

    const configDefaults: ConfigDefaults = {
      configValue_a: 'default-config-value-a',
      configValue_b: 'default-config-value-b',
      configValue_c: 'default-config-value-c',
      configValue_d: {
        nestedConfigValue_e: 'default-nested-config-value-e', 
        nestedConfigValue_f: 'default-nested-config-value-f',
        nestedConfigValue_g: 'default-nested-config-value-g',
      }
    }

    const configInitializer = new ConfigInitializer(
      configProfile,
      configDefaults,
      configLoaderMock,
    )

    const initializedConfig = await configInitializer.initialize();

    expect(initializedConfig).toEqual({ 
      configValue_h: 'config-value-h',
      configValue_i: 'config-value-i',
      configValue_j: 'config-value-j',
      configValue_k : {
        nestedConfigValue_l: 'nested-config-value-l',
        nestedConfigValue_m: 'nested-config-value-m',
        nestedConfigValue_n: 'nested-config-value-n',
      },
    })
  })

  it('should throw error when fail to resolve config value', async () => {
    const configProfile: ConfigObjectProfile = { configValue_a: 'CONFIG_VALUE_A'}

    const configDefaults: ConfigDefaults = {}

    const configInitializer = new ConfigInitializer(
      configProfile,
      configDefaults,
      configLoaderMock,
    )

    const initializerPromise = configInitializer.initialize()

    await expect(initializerPromise).rejects.toThrow(Error)
  })

  it('should throw error when validator returns error', async () => {
    const validator: Core.ValidationFunction = (value: unknown)  => {
      return [ new Core.ValidationError('Some Validation Error'), value as string ]
    }

    const configProfile: ConfigObjectProfile = {
      configValue_a: ['CONFIG_VALUE_A', validator],
    }

    const configDefaults: ConfigDefaults = {}

    const configInitializer = new ConfigInitializer(
      configProfile,
      configDefaults,
      configLoaderMock,
    )

    const initializerPromise = configInitializer.initialize()

    await expect(initializerPromise).rejects.toThrow(Error)
  })
})
