import { UtilsFunction } from './utils-function'

describe('UtilsFunction', () => {
  describe('extractParameters', () => {
    it('should return regular function declaration parameters', () => {
     const arrowFunction = (param1: string, param2: number) => {
        throw new Error('Not to be called!')
     }

     const result = UtilsFunction.extractParameters(arrowFunction)
     expect(result.length).toBe(2)
     expect(result[0]).toEqual('param1')
     expect(result[1]).toEqual('param2')
    })

    it('should return anonymous regular function declaration parameters', () => {
      const result = UtilsFunction.extractParameters((param1: string, param2: number) => {
        throw new Error('Not to be called!')
     })

      expect(result.length).toBe(2)
      expect(result[0]).toEqual('param1')
      expect(result[1]).toEqual('param2')
    })

    it('should return arrow function declaration parameters', () => {
      function regularFunction(param1: string, param2: number) {
        throw new Error('Not to be called!')
      }

      const result = UtilsFunction.extractParameters(regularFunction)
      expect(result.length).toBe(2)
      expect(result[0]).toEqual('param1')
      expect(result[1]).toEqual('param2')
    })

    it('should return anonymous arrow function declaration parameters', () => {
      const result = UtilsFunction.extractParameters(function regularFunction(param1: string, param2: number) {
        throw new Error('Not to be called!')
      })

      expect(result.length).toBe(2)
      expect(result[0]).toEqual('param1')
      expect(result[1]).toEqual('param2')
    })

    it('should return parameters for object-literal shorthand method (via descriptor)', () => {
      const obj = {
        foo(param1: string, param2: number) {
          throw new Error('Not to be called!');
        }
      };
    
      const desc = Object.getOwnPropertyDescriptor(obj, 'foo')!;
      const result = UtilsFunction.extractParameters(desc.value as any);
    
      expect(result.length).toBe(2);
      expect(result[0]).toEqual('param1');
      expect(result[1]).toEqual('param2');
    });
    
    it('should return parameters for class method (via descriptor)', () => {
      class C {
        bar(param1: string, param2: number) {
          throw new Error('Not to be called!');
        }
      }
      const desc = Object.getOwnPropertyDescriptor(C.prototype, 'bar')!;
      const result = UtilsFunction.extractParameters(desc.value as any);
    
      expect(result.length).toBe(2);
      expect(result[0]).toEqual('param1');
      expect(result[1]).toEqual('param2');
    });
  })
})