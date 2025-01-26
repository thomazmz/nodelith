import * as Types from '@nodelith/types'

import { Registration } from '../registration'
import { Bundle } from '../bundle'
import { Module } from './module'

describe('Module', () => {
  function createFunctionRegistration(token: string, target?: Function): Registration {
    return {
      token,
      clone: () => createFunctionRegistration(token, target),
      resolve: target ? (bundle) => target(bundle) : () => 'resolution',
    }
  }

  describe('register', () => {
    it('should throw an error when making a static registration into already used token', () => {
      const module = new Module()
      module.registerStatic('someToken', 'someString')
  
      expect(()  => {
        module.register('someToken', { static: 'anotherString' })
      }).toThrow('Could not complete static registration. Module already contain a registration under "someToken".')
    })

    it('should throw an error when making a function registration into already used token', () => {
      const module = new Module()
      module.registerFunction('someToken', () => { return 'someString' })

      expect(()  => {
        module.register('someToken', { function: () => { return 'anotherString' }})
      }).toThrow('Could not complete function registration. Module already contain a registration under "someToken".')
    })

    it('should throw an error when making a factory registration into already used token', () => {
      const module = new Module()
      module.registerFactory('someToken', () => { return { someString: 'someString' }})
  
      expect(()  => {
        module.register('someToken', {  factory: () => { return { anotherString: 'anotherString' }}})
      }).toThrow('Could not complete factory registration. Module already contain a registration under "someToken".')
    })

    it('should throw an error when making a constructor registration into already used token', () => {
      const module = new Module()
      module.registerConstructor('someToken', class SomeClass {})
  
      expect(()  => {
        module.register('someToken', {  constructor: class  AnotherClass { }})
      }).toThrow('Could not complete constructor registration. Module already contain a registration under "someToken".')
    })

    it('should throw an error when making a static registration with invalid access option', () => {
      const module = new Module()

      expect(() => {
        module.registerStatic('someToken', 'someString', { access: 'invalid' as any })
      }).toThrow('Could not complete static registration. Invalid access option.')
      
  
      expect(()  => {
        module.register('someToken', { static: 'anotherString', access: 'invalid' as any })
      }).toThrow('Could not complete static registration. Invalid access option.')
    })

    it('should throw an error when making a function registration with invalid access option', () => {
      const module = new Module()

      expect(() => {
        module.registerFunction('someToken', () => { return 'someString' }, { access: 'invalid' as any })
      }).toThrow('Could not complete function registration. Invalid access option.')

      expect(()  => {
        module.register('someToken', { function: () => { return 'anotherString' },  access: 'invalid' as any})
      }).toThrow('Could not complete function registration. Invalid access option.')
    })

    it('should throw an error when making a factory registration with invalid access option', () => { 
      const module = new Module()
      
      expect(() => {
        module.registerFactory('someToken', () => { return { someString: 'someString' }}, { access: 'invalid' as any })
      }).toThrow('Could not complete factory registration. Invalid access option.')
  
      expect(()  => {
        module.register('someToken', {  factory: () => { return { anotherString: 'anotherString' }}, access: 'invalid' as any })
      }).toThrow('Could not complete factory registration. Invalid access option.')
    })

    it('should throw an error when making a constructor registration with invalid access option', () => {
      const module = new Module()
      expect(() => {
        module.registerConstructor('someToken', class SomeClass {}, { access: 'invalid' as any })
      }).toThrow('Could not complete constructor registration. Invalid access option.')
  
      expect(()  => {
        module.register('someToken', {  constructor: class  AnotherClass { }, access: 'invalid' as any })
      }).toThrow('Could not complete constructor registration. Invalid access option.')
    })
  })
  
  describe('registerStatic', () => {
    it('should throw an error when trying to making a static registration into already used token', () => {
      const module = new Module()
      module.registerStatic('someToken', 'someString')
  
      expect(()  => {
        module.registerStatic('someToken', 'anotherString')
      }).toThrow('Could not complete static registration. Module already contain a registration under "someToken".')
    })
  })

  describe('registerFunction', () => {
    it('should throw an error when trying to making a function registration into already used token', () => {
      const module = new Module()
      module.registerFunction('someToken', () => { return 'someString' })
  
      expect(()  => {
        module.registerFunction('someToken', () => { return 'anotherString' })
      }).toThrow('Could not complete function registration. Module already contain a registration under "someToken".')
    })
  })

  describe('registerFactory', () => {
    it('should throw an error when trying to making a factory registration into already used token', () => {
      const module = new Module()
      module.registerFactory('someToken', () => { return { someString: 'someString' }})
  
      expect(()  => {
        module.registerFactory('someToken', () => { return { anotherString: 'anotherString' }})
      }).toThrow('Could not complete factory registration. Module already contain a registration under "someToken".')
    })
  })
  
  describe('registerConstructor', () => {
    it('should throw an error when trying to making a constructor registration into already used token', () => {
      const module = new Module()
      module.registerConstructor('someToken', class SomeClass {})
  
      expect(()  => {
        module.registerConstructor('someToken', class AnotherClass {})
      }).toThrow('Could not complete constructor registration. Module already contain a registration under "someToken".')
    })
  })

  describe('useModule', () => {
    it('should throw error when target module already has tokens injected by source module', () => {
      const targetModule = new Module()
      targetModule.useRegistration(createFunctionRegistration('dependency', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      })))

      const sourceModule = new Module()
      sourceModule.useRegistration(createFunctionRegistration('dependency', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      })))

      expect(() => {
        targetModule.useModule(sourceModule)
      }).toThrow('Could not complete registration. Module already contain a registration under "dependency" token.')
    })

    it('should share dependencies between source module and target module', () => {
      const targetModule = new Module()
      const sourceModule = new Module()

      targetModule.useRegistration(createFunctionRegistration('dependency_0', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      })))

      sourceModule.useRegistration(createFunctionRegistration('dependency_1', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      })))

      targetModule.useModule(sourceModule)

      const targetModuleDependency_0 = targetModule.resolve('dependency_0')
      const targetModuleDependency_1 = targetModule.resolve('dependency_1')

      expect(targetModuleDependency_0?.has('dependency_0')).toBe(false)
      expect(targetModuleDependency_0?.has('dependency_1')).toBe(true)

      expect(targetModuleDependency_1?.has('dependency_1')).toBe(false)
      expect(targetModuleDependency_1?.has('dependency_0')).toBe(true)
    })

    it('should not share dependencies between target module and source module', () => {
      const targetModule = new Module()
      const sourceModule = new Module()

      targetModule.useRegistration(createFunctionRegistration('dependency_0', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      })))

      sourceModule.useRegistration(createFunctionRegistration('dependency_1', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      })))

      targetModule.useModule(sourceModule)

      const sourceModuleDependency_0 = sourceModule.resolve('dependency_0')
      const sourceModuleDependency_1 = sourceModule.resolve('dependency_1')

      expect(sourceModuleDependency_0).toBeUndefined()

      expect(sourceModuleDependency_1?.has('dependency_1')).toBe(false)
      expect(sourceModuleDependency_1?.has('dependency_0')).toBe(false)
    })
  })

  describe('useRegistration', () => {
    it('should throw error when target module already has tokens injected by source registration', () => {
      const targetModule = new Module()

      targetModule.useRegistration(createFunctionRegistration('dependency', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      })))

      const sourceRegistration = createFunctionRegistration('dependency', (dependencies: Bundle) => ({
        has: (token: string) => Object.keys(dependencies).includes(token)
      }))

      expect(() => {
        targetModule.useRegistration(sourceRegistration)
      }).toThrow('Could not complete registration. Module already contain a registration under "dependency" token.')
    })
  })
})