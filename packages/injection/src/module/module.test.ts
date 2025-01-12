import { Module } from './module'

describe('Module', () => {
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