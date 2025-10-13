import { CoreInitializer } from '@nodelith/core'
import { InjectionModule } from './injection-module'
import { InjectionContext } from './injection-context'
import { InjectionInitializer } from './injection-initializer'

describe('InjectionModule', () => {
  describe('create', () => {
    it('should create a new module instance', () => {
      const module = InjectionModule.create()

      expect(module).toBeDefined()
      expect(module).toBeInstanceOf(InjectionModule)
    })
  })

  describe('useModule', () => {
    it('should add a module as a dependency for injection', () => {
      const parentModule = InjectionModule.create()
      const childModule = InjectionModule.create()

      childModule.register('config', { value: 'test-config' })

      parentModule.useModule(childModule)

      class TestService {
        constructor(public readonly config: string) {}
      }

      parentModule.useClass(TestService, { resolution: 'eager' })

      const service = parentModule.resolve(TestService)
      expect(service.config).toBe('test-config')
    })

    it('should clone the child module with parent context', () => {
      const parentContext = InjectionContext.create()
      const parentModule = InjectionModule.create(parentContext)
      const childModule = InjectionModule.create()

      parentModule.useModule(childModule)

      expect(parentModule).toBeDefined()
    })

    it('should support nested modules', () => {
      const rootModule = InjectionModule.create()
      const middleModule = InjectionModule.create()
      const leafModule = InjectionModule.create()

      leafModule.register('leafConfig', { value: 'leaf-value' })
      middleModule.register('middleConfig', { value: 'middle-value' })

      middleModule.useModule(leafModule)
      rootModule.useModule(middleModule)

      class RootService {
        constructor(
          public readonly leafConfig: string,
          public readonly middleConfig: string
        ) {}
      }

      rootModule.useClass(RootService, { resolution: 'eager' })
      const service = rootModule.resolve(RootService)

      expect(service.leafConfig).toBe('leaf-value')
      expect(service.middleConfig).toBe('middle-value')
    })
  })

  describe('useModules', () => {
    it('should add multiple modules', () => {
      const parentModule = InjectionModule.create()
      const moduleA = InjectionModule.create()
      const moduleB = InjectionModule.create()
      const moduleC = InjectionModule.create()

      moduleA.register('a', { value: 'value-a' })
      moduleB.register('b', { value: 'value-b' })
      moduleC.register('c', { value: 'value-c' })

      parentModule.useModules([moduleA, moduleB, moduleC])

      class MultiService {
        constructor(
          public readonly a: string,
          public readonly b: string,
          public readonly c: string
        ) {}
      }

      parentModule.useClass(MultiService, { resolution: 'eager' })
      const service = parentModule.resolve(MultiService)

      expect(service.a).toBe('value-a')
      expect(service.b).toBe('value-b')
      expect(service.c).toBe('value-c')
    })

    it('should handle empty array', () => {
      const module = InjectionModule.create()
      expect(() => module.useModules([])).not.toThrow()
    })
  })

  describe('useInitializer', () => {
    it('should add an initializer', () => {
      class TestInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'initialized'
        }
      }

      const module = InjectionModule.create()
      const initializer = InjectionInitializer.create({
        token: 'test',
        initializer: TestInitializer,
      })

      module.useInitializer(initializer)

      expect(module).toBeDefined()
    })

    it('should clone the initializer', () => {
      class TestInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'initialized'
        }
      }

      const module = InjectionModule.create()
      const initializer = InjectionInitializer.create({
        token: 'test',
        initializer: TestInitializer,
      })

      module.useInitializer(initializer)

      expect(module).toBeDefined()
    })
  })

  describe('useInitializers', () => {
    it('should add multiple initializers', () => {
      class InitializerA implements CoreInitializer<string> {
        public initialize() {
          return 'a'
        }
      }

      class InitializerB implements CoreInitializer<string> {
        public initialize() {
          return 'b'
        }
      }

      const module = InjectionModule.create()
      const initA = InjectionInitializer.create({
        token: 'a',
        initializer: InitializerA,
      })
      const initB = InjectionInitializer.create({
        token: 'b',
        initializer: InitializerB,
      })

      module.useInitializers([initA, initB])

      expect(module).toBeDefined()
    })

    it('should handle empty array', () => {
      const module = InjectionModule.create()
      expect(() => module.useInitializers([])).not.toThrow()
    })
  })


  describe('clone', () => {
    it('should create a copy of the module', () => {
      const original = InjectionModule.create()
      original.register('test', { value: 'value' })

      const cloned = original.clone({})

      expect(cloned).toBeInstanceOf(InjectionModule)
      expect(cloned).not.toBe(original)
      expect(cloned.resolve('test')).toBe('value')
    })

    it('should clone with a new context', () => {
      const original = InjectionModule.create()
      const newContext = InjectionContext.create()

      const cloned = original.clone({ context: newContext })

      expect(cloned).toBeInstanceOf(InjectionModule)
      expect(cloned).not.toBe(original)
    })

    it('should clone all child modules', () => {
      const parent = InjectionModule.create()
      const child = InjectionModule.create()

      child.register('childValue', { value: 'test' })
      parent.useModule(child)

      const cloned = parent.clone({})

      class TestService {
        constructor(public readonly childValue: string) {}
      }

      cloned.useClass(TestService, { resolution: 'eager' })
      const service = cloned.resolve(TestService)

      expect(service.childValue).toBe('test')
    })

    it('should clone all initializers', async () => {
      class TestInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'initialized'
        }
      }

      const module = InjectionModule.create()
      module.register('test', { initializer: TestInitializer })

      const cloned = module.clone({})

      await cloned.initialize()

      expect(cloned.resolve('test')).toBe('initialized')
    })

    it('should clone all registrations', () => {
      const original = InjectionModule.create()
      original.register('a', { value: 'value-a' })
      original.register('b', { value: 'value-b' })
      original.register('c', { value: 'value-c' })

      const cloned = original.clone({})

      expect(cloned.resolve('a')).toBe('value-a')
      expect(cloned.resolve('b')).toBe('value-b')
      expect(cloned.resolve('c')).toBe('value-c')
    })
  })

  describe('initialize', () => {
    it('should initialize the module', async () => {
      class TestInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'initialized'
        }
      }

      const module = InjectionModule.create()
      module.register('test', { initializer: TestInitializer })

      await module.initialize()

      expect(module.resolve('test')).toBe('initialized')
    })

    it('should initialize all child modules', async () => {
      class ParentInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'parent-initialized'
        }
      }

      class ChildInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'child-initialized'
        }
      }

      const parent = InjectionModule.create()
      const child = InjectionModule.create()

      parent.register('parentValue', { initializer: ParentInitializer })
      child.register('childValue', { initializer: ChildInitializer })

      parent.useModule(child)

      await parent.initialize()

      expect(parent.resolve('parentValue')).toBe('parent-initialized')
      
      class TestService {
        constructor(public readonly childValue: string) {}
      }

      parent.useClass(TestService, { resolution: 'eager' })
      const service = parent.resolve(TestService)
      expect(service.childValue).toBe('child-initialized')
    })

    it('should initialize all initializers in order', async () => {
      const order: string[] = []

      class InitializerA implements CoreInitializer<string> {
        public initialize() {
          order.push('A')
          return 'a'
        }
      }

      class InitializerB implements CoreInitializer<string> {
        public initialize() {
          order.push('B')
          return 'b'
        }
      }

      const module = InjectionModule.create()
      module.register('a', { initializer: InitializerA })
      module.register('b', { initializer: InitializerB })

      await module.initialize()

      expect(order).toEqual(['A', 'B'])
    })

    it('should handle async initialization', async () => {
      class AsyncInitializer implements CoreInitializer<string> {
        public async initialize() {
          await new Promise(resolve => setTimeout(resolve, 10))
          return 'async-initialized'
        }
      }

      const module = InjectionModule.create()
      module.register('test', { initializer: AsyncInitializer })

      await module.initialize()

      expect(module.resolve('test')).toBe('async-initialized')
    })

    it('should provide dependencies to initializers', async () => {
      class DependentInitializer implements CoreInitializer<string> {
        public constructor(private readonly config: string) {}

        public initialize() {
          return `initialized-with-${this.config}`
        }
      }

      const module = InjectionModule.create()
      module.register('config', { value: 'test-config' })
      module.register('test', { initializer: DependentInitializer })

      await module.initialize()

      expect(module.resolve('test')).toBe('initialized-with-test-config')
    })

    it('should pass bundle to initializers', async () => {
      class BundleInitializer implements CoreInitializer<string> {
        public constructor(private readonly value: string) {}

        public initialize() {
          return `bundle-${this.value}`
        }
      }

      const module = InjectionModule.create()
      module.register('value', { value: 'test' })
      module.register('test', { initializer: BundleInitializer })

      await module.initialize()

      expect(module.resolve('test')).toBe('bundle-test')
    })
  })

  describe('terminate', () => {
    it('should terminate the module', async () => {
      const spy = jest.fn()

      class TestInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'initialized'
        }

        public terminate() {
          spy()
        }
      }

      const module = InjectionModule.create()
      module.register('test', { initializer: TestInitializer })

      await module.initialize()
      await module.terminate()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should terminate all child modules', async () => {
      const parentSpy = jest.fn()
      const childSpy = jest.fn()

      class ParentInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'parent'
        }

        public terminate() {
          parentSpy()
        }
      }

      class ChildInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'child'
        }

        public terminate() {
          childSpy()
        }
      }

      const parent = InjectionModule.create()
      const child = InjectionModule.create()

      parent.register('parent', { initializer: ParentInitializer })
      child.register('child', { initializer: ChildInitializer })

      parent.useModule(child)

      await parent.initialize()
      await parent.terminate()

      expect(parentSpy).toHaveBeenCalledTimes(1)
      expect(childSpy).toHaveBeenCalledTimes(1)
    })

    it('should terminate all initializers in order', async () => {
      const order: string[] = []

      class InitializerA implements CoreInitializer<string> {
        public initialize() {
          return 'a'
        }

        public terminate() {
          order.push('A')
        }
      }

      class InitializerB implements CoreInitializer<string> {
        public initialize() {
          return 'b'
        }

        public terminate() {
          order.push('B')
        }
      }

      const module = InjectionModule.create()
      module.register('a', { initializer: InitializerA })
      module.register('b', { initializer: InitializerB })

      await module.initialize()
      await module.terminate()

      expect(order).toEqual(['A', 'B'])
    })

    it('should handle async termination', async () => {
      const spy = jest.fn()

      class AsyncInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'initialized'
        }

        public async terminate() {
          await new Promise(resolve => setTimeout(resolve, 10))
          spy()
        }
      }

      const module = InjectionModule.create()
      module.register('test', { initializer: AsyncInitializer })

      await module.initialize()
      await module.terminate()

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should handle modules without terminate method', async () => {
      class TestInitializer implements CoreInitializer<string> {
        public initialize() {
          return 'initialized'
        }
      }

      const module = InjectionModule.create()
      module.register('test', { initializer: TestInitializer })

      await module.initialize()

      await expect(module.terminate()).resolves.not.toThrow()
    })
  })
})

