import * as Types from '@nodelith/types'
import { Module } from './module'

describe('Module', () => {
  interface GenericInterface {
    call(): string
  }

  class SomeClass implements GenericInterface {
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

  class AnotherClass implements GenericInterface {
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

  const someFactory = (bundle: {
    anotherFactoryInstance: ReturnType<typeof anotherFactory>
  }) => {
    return {
      call() { return 'someFactory::call' },
      callAnother() { return bundle.anotherFactoryInstance.call() },
    }
  }

  const anotherFactory = (bundle: {
    someFactoryInstance: ReturnType<typeof someFactory>
  }) => {
    return {
      call() { return 'anotherFactory::call' },
      callSome() { return bundle.someFactoryInstance.call() },
    }
  }

  describe('register', () => {
    it('Should throw error when registration key is already in used', () => {
      const module = new Module()
      module.registerConstructor('someClassInstance', SomeClass)
      module.registerConstructor('anotherClassInstance', AnotherClass)
  
      expect(() => module.registerConstructor('someClassInstance', SomeClass)).toThrow()
    })

    it('Should register constructor registration', () => {
      const module = new Module()

      class SomeClass {
        public readonly value: string = 'someValue'
      }

      module.registerConstructor('someToken', SomeClass);
      expect(module.registrations.length).toBe(1)
      expect(module.registrations[0]?.token).toEqual('someToken')
      expect(module.registrations[0]?.resolution.value).toEqual('someValue')
    })

    it('Should register resolver registration', () => {
      const module = new Module()

      const someResolver: Types.Resolver = () => {
        return 'someValue'
      }

      module.registerResolver('someToken', someResolver);
      expect(module.registrations.length).toBe(1)
      expect(module.registrations[0]?.token).toEqual('someToken')
      expect(module.registrations[0]?.resolution).toEqual('someValue')
    })

    it('Should register factory registration', () => {
      const module = new Module()

      const someFactory: Types.Factory = () => {
        return { value: 'someValue' }
      }

      module.registerFactory('someToken', someFactory);
      expect(module.registrations.length).toBe(1)
      expect(module.registrations[0]?.token).toEqual('someToken')
      expect(module.registrations[0]?.resolution.value).toEqual('someValue')
    })

    it('Should register value registration', () => {
      const module = new Module()

      const someValue = 'someValue'

      module.registerValue('someToken', someValue)
      expect(module.registrations.length).toBe(1)
      expect(module.registrations[0]?.token).toEqual('someToken')
      expect(module.registrations[0]?.resolution).toEqual('someValue')
    })
  })

  describe('resolveToken', () => {
    it('Should throw error when registration key does not exist', () => {
      const module = new Module()

      module.registerConstructor('someClassInstance', SomeClass)
      module.registerConstructor('anotherClassInstance', AnotherClass)

      expect(() => module.resolveToken('invalidKey')).toThrow()
    })
    
    it('Should correctly call resolved class instances injected under resolved primary instance', () => {
      const module = new Module()

      module.registerConstructor('someClassInstance', SomeClass)
      module.registerConstructor('anotherClassInstance', AnotherClass)

      const someClassInstance = module.resolveToken<SomeClass>('someClassInstance')

      expect(someClassInstance.call()).toEqual('SomeClass::call')
      expect(someClassInstance.callAnother()).toEqual('AnotherClass::call')
    })
  
    it('Should correctly call resolved class instances injected under resolved secondary instance', () => {
      const module = new Module()

      module.registerConstructor('someClassInstance', SomeClass)
      module.registerConstructor('anotherClassInstance', AnotherClass)

      const anotherClassInstance = module.resolveToken<AnotherClass>('anotherClassInstance')

      expect(anotherClassInstance.call()).toEqual('AnotherClass::call')
      expect(anotherClassInstance.callSome()).toEqual('SomeClass::call')
    })

    it('Should correctly call resolved factory instances injected under resolved primary instance', () => {
      const module = new Module()

      module.registerFactory('someFactoryInstance', someFactory)
      module.registerFactory('anotherFactoryInstance', anotherFactory)

      const someFactoryInstance = module.resolveToken<ReturnType<typeof someFactory>>('someFactoryInstance')

      expect(someFactoryInstance.call()).toEqual('someFactory::call')
      expect(someFactoryInstance.callAnother()).toEqual('anotherFactory::call')
    })
  
    it('Should correctly call resolved factory instances injected under resolved secondary instance', () => {
      const module = new Module()

      module.registerFactory('someFactoryInstance', someFactory)
      module.registerFactory('anotherFactoryInstance', anotherFactory)

      const anotherFactoryInstance = module.resolveToken<ReturnType<typeof someFactory>>('anotherFactoryInstance')

      expect(anotherFactoryInstance.call()).toEqual('anotherFactory::call')
      expect(anotherFactoryInstance.callSome()).toEqual('someFactory::call')
    })
  })

  describe('resolveFactory', () => {
    const stubFactory = (bundle: {
      someFactoryInstance: ReturnType<typeof someFactory>,
      anotherFactoryInstance: ReturnType<typeof anotherFactory>
    }) => {
      return {
        callSome() { return bundle.someFactoryInstance.call() },
        callAnother() { return bundle.anotherFactoryInstance.call() },
      }
    }

    it('should resolve factory', () => {
      const module = new Module()
  
      module.registerFactory('someFactoryInstance', someFactory)
      module.registerFactory('anotherFactoryInstance', anotherFactory)
  
      const stub = module.resolveFactory(stubFactory)
  
      expect(stub.callSome()).toBe('someFactory::call')
      expect(stub.callAnother()).toBe('anotherFactory::call')
    })
  })

  describe('resolveClass', () => {
    class StubClass {
      private readonly someClassInstance: SomeClass
      private readonly anotherClassInstance: AnotherClass
    
      public constructor(bundle: {
        someClassInstance: SomeClass,
        anotherClassInstance: AnotherClass
      }) {
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

    it('should resolve class', () => {
      const module = new Module()
  
      module.registerConstructor('someClassInstance', SomeClass)
      module.registerConstructor('anotherClassInstance', AnotherClass)
  
      const stub = module.resolveConstructor(StubClass)
  
      expect(stub.callSome()).toBe('SomeClass::call')
      expect(stub.callAnother()).toBe('AnotherClass::call')
    })
  })
})
