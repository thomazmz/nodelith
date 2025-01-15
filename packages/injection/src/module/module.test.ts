import { hasUncaughtExceptionCaptureCallback } from 'process'
import { Module } from './module'
import * as Types from '@nodelith/types'
import { access } from 'fs'
import { Registration } from 'registration'
import { Container } from 'container'

describe('Module', () => {
  describe('register', () => {
    it('should throw an error when making a registration without target', () => {
      const module = new Module()
  
      expect(() =>  {
        module.register('someToken', Object.create(null))
      }).toThrow('Could not register "someToken". Given options are missing a valid registration target.')
    })

    it('should throw an error when factory registration target is not a function', () => {
      const module = new Module()
  
      expect(() =>  {
        module.register('someToken', { factory: 'fakeFactory' as any as Types.Factory })
      }).toThrow('Could not register "someToken". Provided factory should be of type "function".')
    })
  
    it('should throw an error when function registration target is not a function', () => {
      const module = new Module()
  
      expect(() =>  {
        module.register('someToken', { function: 'fakeFunction' as any as Types.Function })
      }).toThrow('Could not register "someToken". Provided function should be of type "function".')
    })
  
    it('should throw an error when constructor registration target is not a function', () => {
      const module = new Module()
  
      expect(() =>  {
        module.register('someToken', { constructor: 'fakeConstructor' as any as Types.Constructor })
      }).toThrow('Could not register "someToken". Provided constructor should be of type "function".')
    })

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

  describe('hey', () => {
    it('', () => {
      const dep1 = (dependencies) => {
        return `dependencies-${dependencies.dep2}`
      }
      const dep2 = (dependencies) => {
        return `dependencies-${dependencies.dep1}`
      }
    })
  })
})