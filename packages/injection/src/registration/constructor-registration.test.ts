import { Bundle } from 'bundle'
import { ConstructorRegistration } from './constructor-registration'

describe('ConstructorRegistration', () => {
  describe('resolve', () => {
    it('should inject dependencies from bundles', () => {
      const registration = new ConstructorRegistration({
        bundle: { 
          dependency_0: 'dependency_0',
        },
        target: class { 
          public dependency_0: any
          public dependency_1: any
          constructor(bundle: Bundle) {
            this.dependency_0 = bundle.dependency_0
            this.dependency_1 = bundle.dependency_1
          } 
        }
      })
  
      const resolution = registration.resolve({
        dependency_1: 'dependency_1'
      })
  
      expect(resolution.dependency_0).toBe('dependency_0')
      expect(resolution.dependency_1).toBe('dependency_1')
    })
  
    it('should not override original bundle during resolution', () => {
      const registration = new ConstructorRegistration({
        bundle: { 
          dependency_0: 'dependency_0',
          dependency_1: 'dependency_1',
        },
        target: class { 
          public dependency_0: any
          public dependency_1: any
          constructor(bundle: Bundle) {
            this.dependency_0 = bundle.dependency_0
            this.dependency_1 = bundle.dependency_1
          } 
        }
      })
  
      const resolution = registration.resolve({
        dependency_0: 'another_dependency_0',
        dependency_1: 'another_dependency_1',
      })
  
      expect(resolution.dependency_0).toBe('dependency_0')
      expect(resolution.dependency_1).toBe('dependency_1')
    })
  })
})