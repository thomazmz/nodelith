import { InjectionRegistration } from './injection-registration'
import { InjectionContainer } from './injection-container'
import { InjectionContext } from './injection-context'
import { InjectionBundle } from './injection-bundle'

describe('InjectionContainer', () => {
  describe('create', () => {
    it('should create a new container instance', () => {
      const container = InjectionContainer.create()
  
      expect(container).toBeDefined()
      expect(container).toBeInstanceOf(InjectionContainer)
    })
  })

  describe('useRegistration', () => {
    it('should add a registration to the container', () => {
      const container = InjectionContainer.create()

      const registration = InjectionRegistration.create({
        token: 'test',
        value: 'test-value',
      })

      container.useRegistration(registration)

      expect(container.resolve('test')).toBe('test-value')
    })

    it('should return the container for chaining', () => {
      const container = InjectionContainer.create()

      const registration = InjectionRegistration.create({
        token: 'test',
        value: 'test-value',
      })

      const result = container.useRegistration(registration)

      expect(result).toBe(container)
    })

    it('should throw error when adding duplicate registration', () => {
      const expectedError = 'Could not add registration "test". Container already includes a registration under the same token.'

      const container = InjectionContainer.create()

      const registration1 = InjectionRegistration.create({
        token: 'test',
        value: 'value1',
      })

      const registration2 = InjectionRegistration.create({
        token: 'test',
        value: 'value2',
      })

      container.useRegistration(registration1)

      expect(() => container.useRegistration(registration2)).toThrow(expectedError)
    })
  })

  describe('useRegistrations', () => {
    it('should add multiple registrations to the container', () => {
      const container = InjectionContainer.create()

      const registrations = [
        InjectionRegistration.create({ token: 'a', value: 'value-a' }),
        InjectionRegistration.create({ token: 'b', value: 'value-b' }),
        InjectionRegistration.create({ token: 'c', value: 'value-c' }),
      ]

      container.useRegistrations(registrations)

      expect(container.resolve('a')).toBe('value-a')
      expect(container.resolve('b')).toBe('value-b')
      expect(container.resolve('c')).toBe('value-c')
    })

    it('should return the container for chaining', () => {
      const container = InjectionContainer.create()

      const registrations = [
        InjectionRegistration.create({ token: 'a', value: 'value-a' }),
      ]

      const result = container.useRegistrations(registrations)

      expect(result).toBe(container)
    })

    it('should throw error when adding duplicate registration', () => {
      const expectedError = 'Could not add registration "test". Container already includes a registration under the same token.'

      const container = InjectionContainer.create()

      expect(() => container.useRegistrations([
        InjectionRegistration.create({ token: 'test', value: 'value1' }),
        InjectionRegistration.create({ token: 'test', value: 'value2' }),
      ])).toThrow(expectedError)
    })

    it('should handle empty registrations array', () => {
      const container = InjectionContainer.create()

      expect(() => {
        container.useRegistrations([])
      }).not.toThrow()
    })
  })

  describe('useFunction', () => {
    it('should register a function using its identity as token', () => {
      const container = InjectionContainer.create()

      const fn = (a: number, b: number) => a + b

      container.useFunction(fn)
      container.registerValue('a', 10)
      container.registerValue('b', 20)

      expect(container.resolve(fn)).toBe(30)
    })

    it('should return the container for chaining', () => {
      const container = InjectionContainer.create()

      const fn = () => 'result'

      const result = container.useFunction(fn)

      expect(result).toBe(container)
    })

    it('should support mixed function options', () => {
      const container = InjectionContainer.create()
      const spy = jest.fn()

      const fn = () => {
        spy()
        return { value: 'test' }
      }

      container.useFunction(fn, { token: 'token', lifecycle: 'singleton' })

      const result1 = container.resolve('token')
      const result2 = container.resolve('token')

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })
  })

  describe('useFactory', () => {
    it('should register a factory using its identity as token', () => {
      const container = InjectionContainer.create()

      const factory = (prefix: string, suffix: string) => ({
        format: (value: string) => `${prefix}${value}${suffix}`,
      })

      container.useFactory(factory)
      container.registerValue('prefix', '[')
      container.registerValue('suffix', ']')

      const formatter = container.resolve(factory)

      expect(formatter.format('test')).toBe('[test]')
    })

    it('should return the container for chaining', () => {
      const container = InjectionContainer.create()

      const factory = () => ({ type: 'factory' })

      const result = container.useFactory(factory)

      expect(result).toBe(container)
    })

    it('should support equality check on proxy resolutions', () => {
      const container = InjectionContainer.create()

      const factory = () => ({ value: 'test' })

      container.useFactory(factory, { token: 'token', lifecycle: 'singleton', resolution: 'proxy' })

      const result1 = container.resolve('token')
      const result2 = container.resolve('token')

      expect(result1).toBe(result2)
    })

    it('should support mixed factory options', () => {
      const container = InjectionContainer.create()
      const spy = jest.fn()

      const factory = () => {
        spy()
        return { value: 'test' }
      }

      container.useFactory(factory, { token: 'token', lifecycle: 'singleton', resolution: 'eager' })

      const result1 = container.resolve('token')
      const result2 = container.resolve('token')

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })
  })

  describe('useClass', () => {
    it('should register a class using its identity as token', () => {
      const container = InjectionContainer.create()

      class TestClass {
        constructor(public readonly config: string) {}

        public getValue() {
          return this.config
        }
      }

      container.useClass(TestClass, { resolution: 'eager' })
      container.registerValue('config', 'test-config')

      const service = container.resolve(TestClass)

      expect(service).toBeInstanceOf(TestClass)
      expect(service.getValue()).toBe('test-config')
    })

    it('should return the container for chaining', () => {
      const container = InjectionContainer.create()

      class TestClass {}

      const result = container.useClass(TestClass)

      expect(result).toBe(container)
    })

    it('should support equality check on proxy resolutions', () => {
      const container = InjectionContainer.create()

      class TestClass {}

      container.useClass(TestClass, { token: 'token', lifecycle: 'singleton', resolution: 'proxy' })

      const result1 = container.resolve('token')
      const result2 = container.resolve('token')
      expect(result1).toBe(result2)
    })

    it('should support class mixed options', () => {
      const container = InjectionContainer.create()
      const spy = jest.fn()

      class TestClass {
        public constructor() {
          spy()
        }
      }

      container.useClass(TestClass, { token: 'token', lifecycle: 'singleton', resolution: 'eager' })

      const result1 = container.resolve('token')
      const result2 = container.resolve('token')

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })
  })

  describe('resolve', () => {
    it('should resolve a registered token', () => {
      const container = InjectionContainer.create()

      container.registerValue('test', 'test-value')

      expect(container.resolve('test')).toBe('test-value')
    })

    it('should throw error when resolving unregistered token', () => {
      const container = InjectionContainer.create()

      expect(() => {
        container.resolve('unknown')
      }).toThrow('Could not resolve token "unknown". Container does not have a registration under the given token.')
    })

    it('should resolve a function by its identity', () => {
      const container = InjectionContainer.create()

      const fn = () => 'result'

      container.useFunction(fn)

      expect(container.resolve(fn)).toBe('result')
    })

    it('should resolve a factory by its identity', () => {
      const container = InjectionContainer.create()

      const factory = () => ({ type: 'factory' })

      container.useFactory(factory, { resolution: 'eager' })

      expect(container.resolve(factory)).toEqual({ type: 'factory' })
    })

    it('should resolve a class by its identity', () => {
      const container = InjectionContainer.create()

      class TestClass {}

      container.useClass(TestClass, { resolution: 'eager' })

      expect(container.resolve(TestClass)).toBeInstanceOf(TestClass)
    })

    it('should resolve dependencies from the bundle', () => {
      const container = InjectionContainer.create()

      container.registerValue('a', 10)
      container.registerValue('b', 20)
      container.registerFunction('sum', (a: number, b: number) => a + b)

      expect(container.resolve('sum')).toBe(30)
    })

    it('should create a new context if none is provided', () => {
      const container = InjectionContainer.create()

      const spy = jest.fn()

      container.registerFunction('test', () => {
        spy()
        return { id: Math.random() }
      }, { lifecycle: 'scoped' })

      const result1 = container.resolve('test')
      const result2 = container.resolve('test')

      expect(spy).toHaveBeenCalledTimes(2)
      expect(result1).not.toBe(result2)
    })

    it('should use provided context for scoped resolution', () => {
      const container = InjectionContainer.create()

      const spy = jest.fn()

      container.registerFunction('test', () => {
        spy()
        return { id: Math.random() }
      }, { lifecycle: 'scoped' })

      const context = InjectionContext.create()

      const result1 = container.resolve('test', { context })
      const result2 = container.resolve('test', { context })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(result1).toBe(result2)
    })

    it('should detect circular dependencies', () => {
      const container = InjectionContainer.create()

      container.registerFunction('a', (b: string) => `a:${b}`)
      container.registerFunction('b', (c: string) => `b:${c}`)
      container.registerFunction('c', (a: string) => `c:${a}`)

      expect(() => {
        container.resolve('a')
      }).toThrow(/Could not resolve token "a". Cyclic dependency graph:/)
    })

    it('should detect self-referencing circular dependency', () => {
      const container = InjectionContainer.create()

      const fn = (bundle: InjectionBundle) => bundle['token']

      container.registerFunction('token', fn, { provision: 'bundle' })

      expect(() => container.resolve('token')).toThrow(/Could not resolve token .* Cyclic dependency graph:/)
    })

    it('should support bundle in resolution options', () => {
      const container = InjectionContainer.create()

      container.registerFunction('computed', (external: string) => `computed:${external}`)

      const context = InjectionContext.create()
      const externalBundle = { external: 'external-value' }

      const result = container.resolve('computed', { context, bundle: externalBundle as any })

      expect(result).toBe('computed:external-value')
    })

    it('should resolve transitive dependencies', () => {
      const container = InjectionContainer.create()

      container.registerValue('config', { host: 'localhost' })
      container.registerFunction('logger', () => ({ log: (msg: string) => msg }), { resolution: 'eager' })
      container.registerFunction('database', (config: any, logger: any) => ({
        config,
        logger,
        connect: () => `connected to ${config.host}`,
      }), { resolution: 'eager' })

      const database = container.resolve('database')

      expect(database.connect()).toBe('connected to localhost')
      expect(database.config).toEqual({ host: 'localhost' })
    })
  })

  describe('clone', () => {
    it('should create a copy of the container', () => {
      const container = InjectionContainer.create()

      container.registerValue('test', 'test-value')

      const clone = container.clone()

      expect(clone.resolve('test')).toBe('test-value')
    })

    it('should create a new context for the clone', () => {
      const context1 = InjectionContext.create()
      const container = InjectionContainer.create(context1)

      const spy = jest.fn()

      container.registerFunction('test', () => {
        spy()
        return { id: Math.random() }
      }, { lifecycle: 'scoped' })

      const clone = container.clone()

      const contextA = InjectionContext.create()
      const contextB = InjectionContext.create()

      const result1 = container.resolve('test', { context: contextA })
      const result2 = clone.resolve('test', { context: contextB })

      expect(result1).not.toBe(result2)
    })

    it('should allow cloning with a specific context', () => {
      const container = InjectionContainer.create()

      container.registerValue('test', 'test-value')

      const context = InjectionContext.create()
      const clone = container.clone(context)

      expect(clone.resolve('test')).toBe('test-value')
    })

    it('should maintain all registrations in the clone', () => {
      const container = InjectionContainer.create()

      container.registerValue('a', 'value-a')
      container.registerValue('b', 'value-b')
      container.registerValue('c', 'value-c')
      container.registerFunction('computed', (a: string, b: string, c: string) => `${a}:${b}:${c}`)

      const clone = container.clone()

      expect(clone.resolve('a')).toBe('value-a')
      expect(clone.resolve('b')).toBe('value-b')
      expect(clone.resolve('c')).toBe('value-c')
      expect(clone.resolve('computed')).toBe('value-a:value-b:value-c')
    })

    it('should not affect original container when modifying clone', () => {
      const container = InjectionContainer.create()

      container.registerValue('test', 'original')

      const clone = container.clone()

      clone.registerValue('new', 'new-value')

      expect(container.resolve('test')).toBe('original')
      expect(clone.resolve('test')).toBe('original')
      expect(clone.resolve('new')).toBe('new-value')

      expect(() => {
        container.resolve('new')
      }).toThrow()
    })
  })
})

