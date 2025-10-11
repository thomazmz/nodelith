import { UtilsConstructor } from './utils-constructor'

describe('UtilsConstructor', () => {
  describe('extractParameters', () => {
    it('should return class constructor parameters', () => {
     class SomeClass {
      public constructor(param1: string, param2: number) {
        throw new Error('Not to be called!')
      }
     }

     const result = UtilsConstructor.extractParameters(SomeClass)
     expect(result.length).toBe(2)
     expect(result[0]).toEqual('param1')
     expect(result[1]).toEqual('param2')
    })

    it('should return empty parameters array when no constructor is declared for class', () => {
     class SomeClass {}

     const result = UtilsConstructor.extractParameters(SomeClass)
     expect(result.length).toBe(0)
    })

    it('should return anonymous class constructor parameters', () => {
      const result = UtilsConstructor.extractParameters(class {
        public constructor(param1: string, param2: number) {
          throw new Error('Not to be called!')
        }
      })

      expect(result.length).toBe(2)
      expect(result[0]).toEqual('param1')
      expect(result[1]).toEqual('param2')
    })

    it('should return empty parameters array when no constructor is declared for anonymous class', () => {
     class SomeClass {}

     const result = UtilsConstructor.extractParameters(class {})
     expect(result.length).toBe(0)
    })
  })
})