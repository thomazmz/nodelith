import { ConfigLoader } from './config-loader'

describe('ConfigLoader', () => {

  const testVariableKey = 'TEST_VARIABLE_KEY'
  const testVariableValue = 'TEST_VARIABLE_VALUE'

  beforeEach(() => {
    delete process.env[testVariableKey]
  })

  it('should return environment variable', () => {
    process.env[testVariableKey] = testVariableValue

    const loadedValue = ConfigLoader.load(testVariableKey)

    expect(loadedValue).toEqual(testVariableValue)
  })

  it('should return undefined when environment variable is not defined', () => {
    const testVariableKey = 'TEST_VARIABLE_KEY'

    const loadedValue = ConfigLoader.load(testVariableKey)

    expect(loadedValue).toEqual(undefined)
  })
})