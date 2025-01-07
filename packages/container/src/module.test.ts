import { Module } from './module'

describe('Module', () => {
  interface GenericInterface {
    call(): string
  }

  class SomeClassWithBundle implements GenericInterface {
    private readonly anotherClassInstance: GenericInterface
  
    public constructor(bundle: {
      anotherClassInstance: GenericInterface,
    }) {
      this.anotherClassInstance = bundle.anotherClassInstance
    }

    public call() {
      return 'SomeClass::call'
    }
    public callAnother() {
      return this.anotherClassInstance.call()
    }
  }

  class AnotherClassWithBundle implements GenericInterface {
    private readonly someClassInstance: GenericInterface
  
    public constructor(bundle: {
      someClassInstance: GenericInterface,
    }) {
      this.someClassInstance = bundle.someClassInstance
    }

    public call() {
      return 'AnotherClass::call'
    }
    public callSome() {
      return this.someClassInstance.call()
    }
  }

  class SomeClassWithSpread implements GenericInterface {
    private readonly anotherClassInstance: GenericInterface
  
    public constructor(anotherClassInstance: GenericInterface) {
      this.anotherClassInstance = anotherClassInstance
    }

    public call() {
      return 'SomeClass::call'
    }
    public callAnother() {
      return this.anotherClassInstance.call()
    }
  }

  class AnotherClassWithSpread implements GenericInterface {
    private readonly someClassInstance: GenericInterface
  
    public constructor(someClassInstance: GenericInterface) {
      this.someClassInstance = someClassInstance
    }

    public call() {
      return 'AnotherClass::call'
    }
    public callSome() {
      return this.someClassInstance.call()
    }
  }

  const someFactoryWithBundle = (bundle: {
    anotherFactoryInstance: ReturnType<typeof anotherFactoryWithBundle>
  }) => {
    return {
      call() { return 'someFactory::call' },
      callAnother() { return bundle.anotherFactoryInstance.call() },
    }
  }

  const anotherFactoryWithBundle = (bundle: {
    someFactoryInstance: ReturnType<typeof someFactoryWithBundle>
  }) => {
    return {
      call() { return 'anotherFactory::call' },
      callSome() { return bundle.someFactoryInstance.call() },
    }
  }

  const someFactoryWithSpread = (anotherFactoryInstance: ReturnType<typeof anotherFactoryWithSpread>) => {
    return {
      call() { return 'someFactory::call' },
      callAnother() { return anotherFactoryInstance.call() },
    }
  }

  const anotherFactoryWithSpread = (someFactoryInstance: ReturnType<typeof someFactoryWithSpread>) => {
    return {
      call() { return 'anotherFactory::call' },
      callSome() { return someFactoryInstance.call() },
    }
  }

  describe('register', () => {
    it('Should throw error when registration key is already in use', () => {
      const module = new Module()
      module.registerConstructor('someClassInstance', SomeClassWithBundle)
      expect(() => module.registerConstructor('someClassInstance', SomeClassWithBundle)).toThrow()
    })  
  })

  describe('resolveToken', () => {
    it('Should throw error when registration key does not exist', () => {
      const module = new Module()
      module.registerConstructor('someClassInstance', SomeClassWithBundle)
      expect(() => module.resolveToken('invalidKey')).toThrow()
    })
    
    it('Should correctly call resolved class instances injected under resolved primary instance', () => {
      const bundleModule = new Module({ mode: 'bundle' })

      bundleModule.registerConstructor('someClassInstance', SomeClassWithBundle)
      bundleModule.registerConstructor('anotherClassInstance', AnotherClassWithBundle)

      const someClassInstanceWithBundle = bundleModule.resolveToken<SomeClassWithBundle>('someClassInstance')

      expect(someClassInstanceWithBundle.call()).toEqual('SomeClass::call')
      expect(someClassInstanceWithBundle.callAnother()).toEqual('AnotherClass::call')

      const spreadModule = new Module({ mode: 'spread' })

      spreadModule.registerConstructor('someClassInstance', SomeClassWithSpread)
      spreadModule.registerConstructor('anotherClassInstance', AnotherClassWithSpread)

      const someClassInstanceWithSpread = bundleModule.resolveToken<SomeClassWithSpread>('someClassInstance')

      expect(someClassInstanceWithSpread.call()).toEqual('SomeClass::call')
      expect(someClassInstanceWithSpread.callAnother()).toEqual('AnotherClass::call')
    })
    
    it('Should correctly call resolved class instances injected under resolved primary instance', () => {
      const bundleModule = new Module({ mode: 'bundle' })

      bundleModule.registerConstructor('someClassInstance', SomeClassWithBundle)
      bundleModule.registerConstructor('anotherClassInstance', AnotherClassWithBundle)

      const someClassInstanceWithBundle = bundleModule.resolveToken<SomeClassWithBundle>('someClassInstance')

      expect(someClassInstanceWithBundle.call()).toEqual('SomeClass::call')
      expect(someClassInstanceWithBundle.callAnother()).toEqual('AnotherClass::call')

      const spreadModule = new Module({ mode: 'spread' })

      spreadModule.registerConstructor('someClassInstance', SomeClassWithSpread)
      spreadModule.registerConstructor('anotherClassInstance', AnotherClassWithSpread)

      const someClassInstanceWithSpread = spreadModule.resolveToken<SomeClassWithBundle>('someClassInstance')

      expect(someClassInstanceWithSpread.call()).toEqual('SomeClass::call')
      expect(someClassInstanceWithSpread.callAnother()).toEqual('AnotherClass::call')
    })
  
    it('Should correctly call resolved class instances injected under resolved secondary instance', () => {
      const bundleModule = new Module({ mode: 'bundle' })

      bundleModule.registerConstructor('someClassInstance', SomeClassWithBundle)
      bundleModule.registerConstructor('anotherClassInstance', AnotherClassWithBundle)

      const anotherClassInstanceWithBundle = bundleModule.resolveToken<AnotherClassWithBundle>('anotherClassInstance')

      expect(anotherClassInstanceWithBundle.call()).toEqual('AnotherClass::call')
      expect(anotherClassInstanceWithBundle.callSome()).toEqual('SomeClass::call')

      const spreadModule = new Module({ mode: 'spread' })

      spreadModule.registerConstructor('someClassInstance', SomeClassWithSpread)
      spreadModule.registerConstructor('anotherClassInstance', AnotherClassWithSpread)

      const anotherClassInstanceWithSpread = spreadModule.resolveToken<AnotherClassWithBundle>('anotherClassInstance')

      expect(anotherClassInstanceWithSpread.call()).toEqual('AnotherClass::call')
      expect(anotherClassInstanceWithSpread.callSome()).toEqual('SomeClass::call')
    })

    it('Should correctly call resolved factory instances injected under resolved primary instance', () => {
      const module = new Module({ mode: 'bundle' })

      module.registerFactory('someFactoryInstance', someFactoryWithBundle)
      module.registerFactory('anotherFactoryInstance', anotherFactoryWithBundle)

      const someFactoryInstanceWithBundle = module.resolveToken<ReturnType<typeof someFactoryWithBundle>>('someFactoryInstance')

      expect(someFactoryInstanceWithBundle.call()).toEqual('someFactory::call')
      expect(someFactoryInstanceWithBundle.callAnother()).toEqual('anotherFactory::call')

      const spreadModule = new Module({ mode: 'spread' })

      spreadModule.registerFactory('someFactoryInstance', someFactoryWithSpread)
      spreadModule.registerFactory('anotherFactoryInstance', anotherFactoryWithSpread)

      const someFactoryInstanceWithSpread = spreadModule.resolveToken<ReturnType<typeof someFactoryWithBundle>>('someFactoryInstance')

      expect(someFactoryInstanceWithSpread.call()).toEqual('someFactory::call')
      expect(someFactoryInstanceWithSpread.callAnother()).toEqual('anotherFactory::call')
    })
  
    it('Should correctly call resolved factory instances injected under resolved secondary instance', () => {
      const moduleWithBundle = new Module({ mode: 'bundle' })

      moduleWithBundle.registerFactory('someFactoryInstance', someFactoryWithBundle)
      moduleWithBundle.registerFactory('anotherFactoryInstance', anotherFactoryWithBundle)

      const anotherFactoryInstanceWithBundle = moduleWithBundle.resolveToken<ReturnType<typeof someFactoryWithBundle>>('anotherFactoryInstance')

      expect(anotherFactoryInstanceWithBundle.call()).toEqual('anotherFactory::call')
      expect(anotherFactoryInstanceWithBundle.callSome()).toEqual('someFactory::call')

      const moduleWithSpread = new Module({ mode: 'spread' })

      moduleWithSpread.registerFactory('someFactoryInstance', someFactoryWithSpread)
      moduleWithSpread.registerFactory('anotherFactoryInstance', anotherFactoryWithSpread)

      const anotherFactoryInstance = moduleWithSpread.resolveToken<ReturnType<typeof someFactoryWithSpread>>('anotherFactoryInstance')

      expect(anotherFactoryInstance.call()).toEqual('anotherFactory::call')
      expect(anotherFactoryInstance.callSome()).toEqual('someFactory::call')
    })
  })

  describe('resolveFactory', () => {
    const stubFactoryWithBundle = (bundle: {
      someFactoryInstance: ReturnType<typeof someFactoryWithBundle>,
      anotherFactoryInstance: ReturnType<typeof anotherFactoryWithBundle>
    }) => {
      return {
        callSome() { return bundle.someFactoryInstance.call() },
        callAnother() { return bundle.anotherFactoryInstance.call() },
      }
    }

    const stubFactoryWithSpread = (
      someFactoryInstance: ReturnType<typeof someFactoryWithSpread>,
      anotherFactoryInstance: ReturnType<typeof anotherFactoryWithSpread>
    ) => {
      return {
        callSome() { return someFactoryInstance.call() },
        callAnother() { return anotherFactoryInstance.call() },
      }
    }

    it('should resolve factory using using injection mode spread by default', () => {
      const module = new Module()
  
      module.registerFactory('someFactoryInstance', someFactoryWithSpread)
      module.registerFactory('anotherFactoryInstance', anotherFactoryWithSpread)
  
      const stub = module.resolveFactory(stubFactoryWithSpread)
  
      expect(stub.callSome()).toBe('someFactory::call')
      expect(stub.callAnother()).toBe('anotherFactory::call')
    })

    it('should resolve factory using injection mode bundle explicitly', () => {
      const module = new Module({ mode: 'bundle' })
  
      module.registerFactory('someFactoryInstance', someFactoryWithBundle)
      module.registerFactory('anotherFactoryInstance', anotherFactoryWithBundle)
  
      const stub = module.resolveFactory(stubFactoryWithBundle)
  
      expect(stub.callSome()).toBe('someFactory::call')
      expect(stub.callAnother()).toBe('anotherFactory::call')
    })

    it('should resolve factory using using injection mode spread explicitly', () => {
      const module = new Module({ mode: 'spread' })
  
      module.registerFactory('someFactoryInstance', someFactoryWithSpread)
      module.registerFactory('anotherFactoryInstance', anotherFactoryWithSpread)
  
      const stub = module.resolveFactory(stubFactoryWithSpread)
  
      expect(stub.callSome()).toBe('someFactory::call')
      expect(stub.callAnother()).toBe('anotherFactory::call')
    })
  })

  describe('resolveClass', () => {
    class StubClassWithSpread {
      private readonly someClassInstance: SomeClassWithBundle
      private readonly anotherClassInstance: AnotherClassWithBundle
    
      public constructor(
        someClassInstance: SomeClassWithBundle,
        anotherClassInstance: AnotherClassWithBundle
      ) {
        this.someClassInstance = someClassInstance
        this.anotherClassInstance = anotherClassInstance
      }
  
      public callSome() {
        return this.someClassInstance.call()
      }
      public callAnother() {
        return this.anotherClassInstance.call()
      }
    }

    class StubClassWithBundle {
      private readonly someClassInstance: SomeClassWithBundle
      private readonly anotherClassInstance: AnotherClassWithBundle
    
      public constructor(bundle: {
        someClassInstance: SomeClassWithBundle,
        anotherClassInstance: AnotherClassWithBundle
      }
      ) {
        this.someClassInstance = bundle.someClassInstance
        this.anotherClassInstance = bundle.anotherClassInstance
      }
  
      public callSome() {
        return this.someClassInstance.call()
      }
      public callAnother() {
        return this.anotherClassInstance.call()
      }
    }

    it('should resolve class using injection mode spread by default', () => {
      const module = new Module()
  
      module.registerConstructor('someClassInstance', SomeClassWithSpread)
      module.registerConstructor('anotherClassInstance', AnotherClassWithSpread)
  
      const stub = module.resolveConstructor(StubClassWithSpread)
  
      expect(stub.callSome()).toBe('SomeClass::call')
      expect(stub.callAnother()).toBe('AnotherClass::call')
    })

    it('should resolve class using injection mode bundle explicitly', () => {
      const module = new Module({ mode: 'bundle' })
  
      module.registerConstructor('someClassInstance', SomeClassWithBundle)
      module.registerConstructor('anotherClassInstance', AnotherClassWithBundle)
  
      const stub = module.resolveConstructor(StubClassWithBundle)
  
      expect(stub.callSome()).toBe('SomeClass::call')
      expect(stub.callAnother()).toBe('AnotherClass::call')
    })

    it('should resolve class using injection mode spread explicitly', () => {
      const module = new Module({ mode: 'spread' })
  
      module.registerConstructor('someClassInstance', SomeClassWithSpread)
      module.registerConstructor('anotherClassInstance', AnotherClassWithSpread)
  
      const stub = module.resolveConstructor(StubClassWithSpread)
  
      expect(stub.callSome()).toBe('SomeClass::call')
      expect(stub.callAnother()).toBe('AnotherClass::call')
    })
  })
})
