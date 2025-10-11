import { InjectionInitializer } from './injection-initializer'
import { InjectionRegistration } from './injection-registration'
import { InjectionBundle } from './injection-bundle'
import { InjectionContext } from './injection-context'
import { Core } from '@nodelith/core'

describe('InjectionInitializer', () => {
  it('should create a new initializer instance', () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    expect(initializer).toBeDefined()
    expect(initializer).toBeInstanceOf(InjectionInitializer)
  })

  it('should create an initializer with token', () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'token',
      initializer: TestInitializer,
    })

    expect(initializer).toBeDefined()
  })

  it('should create an initializer with visibility option', () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
      visibility: 'private',
    })

    expect(initializer).toBeDefined()
  })

  it('should initialize and return a registration', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized-value'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    const registration = await initializer.initialize({
      bundle: InjectionBundle.create(),
    })

    expect(registration).toBeInstanceOf(InjectionRegistration)
    expect(registration.token).toBe('test')

    const value = registration.resolve({ bundle: InjectionBundle.create() })
    expect(value).toBe('initialized-value')
  })

  it('should handle async initialization', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public async initialize() {
        await new Promise(resolve => setTimeout(resolve, 10))
        return 'async-initialized-value'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    const registration = await initializer.initialize({
      bundle: InjectionBundle.create(),
    })

    const value = registration.resolve({ bundle: InjectionBundle.create() })
    expect(value).toBe('async-initialized-value')
  })

  it('should resolve initializer class with dependencies', async () => {
    class TestInitializer implements Core.Initializer<string> {
      constructor(private readonly config: string) {}

      public initialize() {
        return `initialized-with-${this.config}`
      }
    }

    const bundle = InjectionBundle.create({
      entries: [['config', { value: 'test-config', enumerable: true, configurable: true }]],
    })

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    const registration = await initializer.initialize({ bundle })

    const value = registration.resolve({ bundle: InjectionBundle.create() })
    expect(value).toBe('initialized-with-test-config')
  })

  it('should return registration with correct visibility', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'value'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
      visibility: 'private',
    })

    const registration = await initializer.initialize({
      bundle: InjectionBundle.create(),
    })

    expect(registration.visibility).toBe('private')
  })

  it('should store initialized instance', async () => {
    const spy = jest.fn()

    class TestInitializer implements Core.Initializer<string> {
      constructor() {
        spy()
      }

      public initialize() {
        return 'value'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await initializer.initialize({ bundle: InjectionBundle.create() })

    expect(spy).toHaveBeenCalledTimes(1)
  })





  it('should call terminate on the initializer instance', async () => {
    const terminateSpy = jest.fn()

    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }

      public terminate() {
        terminateSpy()
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await initializer.initialize({ bundle: InjectionBundle.create() })
    await initializer.terminate()

    expect(terminateSpy).toHaveBeenCalledTimes(1)
  })

  it('should call async terminate on the initializer instance', async () => {
    const terminateSpy = jest.fn()

    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }

      public async terminate() {
        await new Promise(resolve => setTimeout(resolve, 10))
        terminateSpy()
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await initializer.initialize({ bundle: InjectionBundle.create() })
    await initializer.terminate()

    expect(terminateSpy).toHaveBeenCalledTimes(1)
  })

  it('should clear the instance after termination', async () => {
    const terminateSpy = jest.fn()
    const initializeSpy = jest.fn()

    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        initializeSpy()
        return 'initialized'
      }

      public terminate() {
        terminateSpy()
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await initializer.initialize({ bundle: InjectionBundle.create() })
    await initializer.terminate()

    expect(initializeSpy).toHaveBeenCalledTimes(1)
    expect(terminateSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle terminate without initialization', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }

      public terminate() {
        // Should not be called
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await expect(initializer.terminate()).resolves.not.toThrow()
  })

  it('should handle initializer without terminate method', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await initializer.initialize({ bundle: InjectionBundle.create() })

    await expect(initializer.terminate()).resolves.not.toThrow()
  })

  it('should handle multiple terminate calls', async () => {
    const terminateSpy = jest.fn()

    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }

      public terminate() {
        terminateSpy()
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await initializer.initialize({ bundle: InjectionBundle.create() })
    await initializer.terminate()
    await initializer.terminate()

    // Should only call terminate once (on first call)
    expect(terminateSpy).toHaveBeenCalledTimes(1)
  })

  it('should allow re-initialization after termination', async () => {
    const initializeSpy = jest.fn()
    const terminateSpy = jest.fn()

    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        initializeSpy()
        return 'initialized'
      }

      public terminate() {
        terminateSpy()
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    await initializer.initialize({ bundle: InjectionBundle.create() })
    await initializer.terminate()
    await initializer.initialize({ bundle: InjectionBundle.create() })

    expect(initializeSpy).toHaveBeenCalledTimes(2)
    expect(terminateSpy).toHaveBeenCalledTimes(1)
  })

  it('should handle initialization of primitives', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'string-primitive'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    const registration = await initializer.initialize({
      bundle: InjectionBundle.create(),
    })

    const result = registration.resolve({ bundle: InjectionBundle.create() })
    expect(result).toEqual('string-primitive')
  })

  it('should handle initialization of objects', async () => {
    class TestInitializer implements Core.Initializer<{ value: string; count: number }> {
      public initialize() {
        return { value: 'test', count: 42 }
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    const registration = await initializer.initialize({
      bundle: InjectionBundle.create(),
    })

    const result = registration.resolve({ bundle: InjectionBundle.create() })
    expect(result).toEqual({ value: 'test', count: 42 })
  })

  it('should accept multiple dependencies in initializer target', async () => {
    class TestInitializer implements Core.Initializer<string> {
      constructor(
        private readonly host: string,
        private readonly port: number,
        private readonly debug: boolean
      ) {}

      public initialize() {
        return `${this.host}:${this.port}:${this.debug}`
      }
    }

    const bundle = InjectionBundle.create({
      entries: [
        ['host', { value: 'localhost', enumerable: true, configurable: true }],
        ['port', { value: 3000, enumerable: true, configurable: true }],
        ['debug', { value: true, enumerable: true, configurable: true }],
      ],
    })

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    const registration = await initializer.initialize({ bundle })

    const value = registration.resolve({ bundle: InjectionBundle.create() })
    expect(value).toBe('localhost:3000:true')
  })

  it('should create a new instance of the initializer', () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
    })

    const clone = initializer.clone()

    expect(clone).toBeInstanceOf(InjectionInitializer)
    expect(clone).not.toBe(initializer)
  })

  it('should preserve token in cloned initializer', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'original-token',
      initializer: TestInitializer,
    })

    const clone = initializer.clone()

    const registration = await clone.initialize({ bundle: InjectionBundle.create() })

    expect(registration.token).toBe('original-token')
  })

  it('should preserve visibility in cloned initializer', async () => {
    class TestInitializer implements Core.Initializer<string> {
      public initialize() {
        return 'initialized'
      }
    }

    const initializer = InjectionInitializer.create({
      token: 'test',
      initializer: TestInitializer,
      visibility: 'private',
    })

    const clone = initializer.clone()

    const registration = await clone.initialize({ bundle: InjectionBundle.create() })

    expect(registration.visibility).toBe('private')
  })
})

