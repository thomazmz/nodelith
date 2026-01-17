import { ConfigInitializer } from './config-initializer'
import { ConfigProfile } from './config-profile'

type ExampleConfig = {
  name: string
  port: number
  flag: boolean
}

class ExampleInitializer extends ConfigInitializer<ExampleConfig> {
  protected readonly profile = {
    name: ConfigProfile.string('APP_NAME', 'default-app'),
    port: ConfigProfile.number('APP_PORT', 4000),
    flag: ConfigProfile.boolean('APP_FLAG', false),
  }
}

describe('ConfigInitializer', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('prefers environment variables over defaults and custom loader', async () => {
    process.env.APP_NAME = 'env-name'
    process.env.APP_PORT = '8080'
    process.env.APP_FLAG = 'true'

    const loader = { load: jest.fn(() => undefined) }
    const initializer = new ExampleInitializer(loader)
    const result = await initializer.initialize()

    expect(result).toEqual({
      name: 'env-name',
      port: '8080',
      flag: 'true',
    })
    expect(loader.load).not.toHaveBeenCalled()
  })

  it('falls back to custom loader when env is missing', async () => {
    const loader = { load: jest.fn((key: string) => ({ APP_NAME: 'custom', APP_PORT: 1234 } as any)[key]) }
    const initializer = new ExampleInitializer(loader)
    const result = await initializer.initialize()

    expect(result).toEqual({
      name: 'custom',
      port: 1234,
      flag: false,
    })
  })

  it('uses defaults when neither env nor custom loader provides values', async () => {
    const initializer = new ExampleInitializer()
    const result = await initializer.initialize()

    expect(result).toEqual({
      name: 'default-app',
      port: 4000,
      flag: false,
    })
  })
})

