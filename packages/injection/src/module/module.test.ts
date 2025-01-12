import { Module } from './module'
import * as Types from '@nodelith/types'

describe('Module', () => {
  it('should throw an error when trying to make registration without target', () => {
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

  it('should throw an error when resolver registration target is not a function', () => {
    const module = new Module()

    expect(() =>  {
      module.register('someToken', { resolver: 'fakeResolver' as any as Types.Resolver })
    }).toThrow('Could not register "someToken". Provided resolver should be of type "function".')
  })

  it('should throw an error when constructor registration target is not a function', () => {
    const module = new Module()

    expect(() =>  {
      module.register('someToken', { constructor: 'fakeConstructor' as any as Types.Constructor })
    }).toThrow('Could not register "someToken". Provided constructor should be of type "function".')
  })

  it('should throw an error when trying to making a static registration into already used token', () => {
    const module = new Module()
    module.registerStatic('someToken', 'someStaticString')

    expect(()  => {
      module.registerStatic('someToken', 'anotherStaticString')
    }).toThrow('Could not complete static registration. Module already contain a registration under "someToken".')

    expect(()  => {
      module.register('someToken', { static: 'anotherStaticString' })
    }).toThrow('Could not complete static registration. Module already contain a registration under "someToken".')
  })

  it('should throw an error when trying to making a resolver registration into already used token', () => {
    const module = new Module()
    module.registerResolver('someToken', () => { return 'someStaticString' })

    expect(()  => {
      module.registerResolver('someToken', () => { return 'anotherStaticString' })
    }).toThrow('Could not complete resolver registration. Module already contain a registration under "someToken".')

    expect(()  => {
      module.register('someToken', { resolver: () => { return 'anotherStaticString' }})
    }).toThrow('Could not complete resolver registration. Module already contain a registration under "someToken".')
  })

  it('should throw an error when trying to making a factory registration into already used token', () => {
    const module = new Module()
    module.registerFactory('someToken', () => { return { someStaticString: 'someStaticString' }})

    expect(()  => {
      module.registerFactory('someToken', () => { return { anotherStaticString: 'anotherStaticString' }})
    }).toThrow('Could not complete factory registration. Module already contain a registration under "someToken".')

    expect(()  => {
      module.register('someToken', {  factory: () => { return { anotherStaticString: 'anotherStaticString' }}})
    }).toThrow('Could not complete factory registration. Module already contain a registration under "someToken".')
  })

  it('should throw an error when trying to making a constructor registration into already used token', () => {
    const module = new Module()
    module.registerConstructor('someToken', class SomeClass {})

    expect(()  => {
      module.registerConstructor('someToken', class AnotherClass {})
    }).toThrow('Could not complete constructor registration. Module already contain a registration under "someToken".')

    expect(()  => {
      module.register('someToken', {  constructor: class  AnotherClass { }})
    }).toThrow('Could not complete constructor registration. Module already contain a registration under "someToken".')
  })
})